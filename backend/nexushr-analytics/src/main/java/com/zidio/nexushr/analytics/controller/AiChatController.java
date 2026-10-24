package com.zidio.nexushr.analytics.controller;

import com.zidio.nexushr.analytics.dto.ChatRequestDto;
import com.zidio.nexushr.analytics.dto.ChatResponseDto;
import com.zidio.nexushr.analytics.service.AiProvider;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
public class AiChatController {

    private final AiProvider aiProvider;

    public AiChatController(AiProvider aiProvider) {
        this.aiProvider = aiProvider;
    }

    @PostMapping("/chat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChatResponseDto> chat(
            Authentication authentication,
            @Valid @RequestBody ChatRequestDto request) {

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_EMPLOYEE");

        return ResponseEntity.ok(aiProvider.chat(authentication.getName(), role, request.getMessage()));
    }
}
