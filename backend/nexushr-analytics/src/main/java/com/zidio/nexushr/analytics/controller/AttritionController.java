package com.zidio.nexushr.analytics.controller;

import com.zidio.nexushr.analytics.dto.AttritionPredictionDto;
import com.zidio.nexushr.analytics.service.AttritionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics/attrition")
public class AttritionController {

    private final AttritionService attritionService;

    public AttritionController(AttritionService attritionService) {
        this.attritionService = attritionService;
    }

    @GetMapping("/predictions")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXECUTIVE', 'MANAGER')")
    public ResponseEntity<List<AttritionPredictionDto>> getPredictions(
            @RequestParam(required = false) UUID deptId,
            @RequestParam(required = false) String level,
            Authentication authentication) {

        boolean isManagerOnly = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER")) &&
                authentication.getAuthorities().stream()
                        .noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_EXECUTIVE"));

        return ResponseEntity.ok(attritionService.getPredictions(deptId, level, authentication.getName(), isManagerOnly));
    }

    @GetMapping("/{empId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXECUTIVE', 'MANAGER')")
    public ResponseEntity<AttritionPredictionDto> getEmployeePrediction(
            @PathVariable UUID empId,
            Authentication authentication) {

        boolean isManagerOnly = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER")) &&
                authentication.getAuthorities().stream()
                        .noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_EXECUTIVE"));

        return ResponseEntity.ok(attritionService.getPredictionForEmployee(empId, authentication.getName(), isManagerOnly));
    }

    @PostMapping("/refresh")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> refreshPredictions() {
        attritionService.refreshAllPredictions();
        return ResponseEntity.ok(Map.of("message", "Workforce attrition predictions successfully refreshed across all active departments"));
    }
}
