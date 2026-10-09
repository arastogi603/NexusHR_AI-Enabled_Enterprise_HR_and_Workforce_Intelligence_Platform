package com.zidio.nexushr.auth.service;

import com.zidio.nexushr.auth.config.JwtUtils;
import com.zidio.nexushr.auth.dto.AuthRequest;
import com.zidio.nexushr.auth.dto.AuthResponse;
import com.zidio.nexushr.auth.dto.SignupRequest;
import com.zidio.nexushr.auth.entity.Role;
import com.zidio.nexushr.auth.entity.User;
import com.zidio.nexushr.auth.repository.RoleRepository;
import com.zidio.nexushr.auth.repository.UserRepository;
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
            throw new RuntimeException("Email is already in use");
        }

        Role userRole = roleRepository.findByName("ROLE_EMPLOYEE")
                .orElseThrow(() -> new RuntimeException("Default role not found"));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.getRoles().add(userRole);

        userRepository.save(user);

        return generateAuthResponse(user);
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        if (!user.isActive()) {
            throw new RuntimeException("Account is disabled");
        }

        return generateAuthResponse(user);
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
        // Blacklist tokens (we assume front-end passes them in request headers or body)
        // Set expiry equivalent to token valid duration for simplicity
        tokenBlacklistService.blacklistToken(accessToken, 900000); // 15 mins
        tokenBlacklistService.blacklistToken(refreshToken, 604800000); // 7 days
    }

    private AuthResponse generateAuthResponse(User user) {
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        String accessToken = jwtUtils.generateAccessToken(user.getEmail(), roles);
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .roles(roles)
                .build();
    }
}
