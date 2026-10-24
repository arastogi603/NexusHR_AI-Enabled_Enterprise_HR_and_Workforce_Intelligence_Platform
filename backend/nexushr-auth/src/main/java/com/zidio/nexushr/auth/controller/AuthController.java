package com.zidio.nexushr.auth.controller;

import com.zidio.nexushr.auth.dto.AuthRequest;
import com.zidio.nexushr.auth.dto.AuthResponse;
import com.zidio.nexushr.auth.dto.SignupRequest;
import com.zidio.nexushr.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request, jakarta.servlet.http.HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        
        // Set HttpOnly refresh token cookie nx_rt as per D-06
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("nx_rt", authResponse.getRefreshToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // set true in HTTPS production
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(cookie);

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            @RequestBody(required = false) Map<String, String> request,
            @CookieValue(value = "nx_rt", required = false) String cookieRefreshToken,
            jakarta.servlet.http.HttpServletResponse response) {
        
        String tokenToUse = (request != null && request.containsKey("refreshToken")) 
                ? request.get("refreshToken") 
                : cookieRefreshToken;

        if (tokenToUse == null || tokenToUse.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        AuthResponse authResponse = authService.refreshToken(tokenToUse);

        // Rotate refresh cookie
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("nx_rt", authResponse.getRefreshToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(cookie);

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Both currentPassword and newPassword are required"));
        }

        authService.changePassword(authentication.getName(), currentPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader, 
            @RequestBody(required = false) Map<String, String> request,
            @CookieValue(value = "nx_rt", required = false) String cookieRefreshToken,
            jakarta.servlet.http.HttpServletResponse response) {
        
        String accessToken = (authHeader != null && authHeader.startsWith("Bearer ")) 
                ? authHeader.substring(7) 
                : null;
        String refreshToken = (request != null && request.containsKey("refreshToken")) 
                ? request.get("refreshToken") 
                : cookieRefreshToken;

        authService.logout(accessToken, refreshToken);

        // Clear refresh cookie
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("nx_rt", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/api/v1/auth");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        var authorities = authentication.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .toList();

        String primaryRole = authorities.stream()
                .filter(r -> r.equals("ROLE_SUPER_ADMIN") || r.equals("ROLE_ADMIN") || r.equals("ROLE_MANAGER") || r.equals("ROLE_EXECUTIVE"))
                .findFirst()
                .orElse(authorities.isEmpty() ? "ROLE_EMPLOYEE" : authorities.get(0));

        String email = authentication.getName();
        String defaultName = email.split("@")[0];
        String formattedName = java.util.Arrays.stream(defaultName.split("[._]"))
                .map(s -> s.isEmpty() ? s : Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase())
                .collect(java.util.stream.Collectors.joining(" "));

        return ResponseEntity.ok(Map.of(
            "email", email,
            "name", formattedName,
            "role", primaryRole.replace("ROLE_", ""),
            "roles", authorities
        ));
    }

    @GetMapping("/admin-only")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> adminOnlyEndpoint() {
        return ResponseEntity.ok("Hello Admin! RBAC is working.");
    }
}
