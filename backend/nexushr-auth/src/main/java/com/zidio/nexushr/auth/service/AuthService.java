package com.zidio.nexushr.auth.service;

import com.zidio.nexushr.auth.config.JwtUtils;
import com.zidio.nexushr.auth.dto.AuthRequest;
import com.zidio.nexushr.auth.dto.AuthResponse;
import com.zidio.nexushr.auth.dto.SignupRequest;
import com.zidio.nexushr.auth.entity.Role;
import com.zidio.nexushr.auth.entity.User;
import com.zidio.nexushr.auth.repository.RoleRepository;
import com.zidio.nexushr.auth.repository.UserRepository;
import com.zidio.nexushr.common.exception.BusinessRuleException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, JwtUtils jwtUtils,
                       TokenBlacklistService tokenBlacklistService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessRuleException("Email is already in use");
        }

        Role userRole = roleRepository.findByName("ROLE_EMPLOYEE")
                .orElseThrow(() -> new BusinessRuleException("Default role not found"));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.getRoles().add(userRole);

        userRepository.save(user);

        return generateAuthResponse(user);
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BusinessRuleException("Invalid email or password"));

        // Check if locked
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(java.time.LocalDateTime.now())) {
            long remainingMinutes = java.time.Duration.between(java.time.LocalDateTime.now(), user.getLockedUntil()).toMinutes() + 1;
            throw new BusinessRuleException("Account is temporarily locked due to 5 failed attempts. Please retry in " + remainingMinutes + " minutes.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int attempts = user.getFailedAttempts() + 1;
            user.setFailedAttempts(attempts);
            if (attempts >= 5) {
                user.setLockedUntil(java.time.LocalDateTime.now().plusMinutes(15));
            }
            userRepository.save(user);
            throw new BusinessRuleException("Invalid email or password");
        }
        
        if (!user.isActive()) {
            throw new BusinessRuleException("Account is disabled");
        }

        // Reset failed attempts on successful login
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        return generateAuthResponse(user);
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password does not match");
        }

        if (newPassword == null || newPassword.length() < 10) {
            throw new RuntimeException("New password must be at least 10 characters long");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtUtils.extractEmail(refreshToken);
        
        if (tokenBlacklistService.isTokenBlacklisted(refreshToken)) {
            throw new RuntimeException("Token has been invalidated");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (jwtUtils.isTokenValid(refreshToken, user.getEmail())) {
            return generateAuthResponse(user);
        }

        throw new RuntimeException("Invalid refresh token");
    }

    public void logout(String accessToken, String refreshToken) {
        if (accessToken != null && !accessToken.isBlank()) {
            tokenBlacklistService.blacklistToken(accessToken, 900000); // 15 mins
        }
        if (refreshToken != null && !refreshToken.isBlank()) {
            tokenBlacklistService.blacklistToken(refreshToken, 604800000); // 7 days
        }
    }

    private AuthResponse generateAuthResponse(User user) {
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        String primaryRole = roles.stream()
                .filter(r -> r.equals("ROLE_SUPER_ADMIN") || r.equals("ROLE_ADMIN") || r.equals("ROLE_MANAGER") || r.equals("ROLE_EXECUTIVE"))
                .findFirst()
                .orElse(roles.isEmpty() ? "ROLE_EMPLOYEE" : roles.get(0));
        String shortRole = primaryRole.replace("ROLE_", "");

        String accessToken = jwtUtils.generateAccessToken(user.getEmail(), roles);
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        String defaultName = user.getEmail().split("@")[0];
        String formattedName = java.util.Arrays.stream(defaultName.split("[._]"))
                .map(s -> s.isEmpty() ? s : Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .roles(roles)
                .role(shortRole)
                .name(formattedName)
                .mustChangePassword(user.isMustChangePassword())
                .expiresIn(900000L)
                .build();
    }
}
