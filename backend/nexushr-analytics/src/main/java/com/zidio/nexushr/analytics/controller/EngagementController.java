package com.zidio.nexushr.analytics.controller;

import com.zidio.nexushr.analytics.dto.EngagementScoreDto;
import com.zidio.nexushr.analytics.service.EngagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics/engagement")
public class EngagementController {

    private final EngagementService engagementService;

    public EngagementController(EngagementService engagementService) {
        this.engagementService = engagementService;
    }

    @GetMapping("/scores")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXECUTIVE', 'MANAGER')")
    public ResponseEntity<List<EngagementScoreDto>> getEngagementScores(@RequestParam(required = false) UUID deptId) {
        return ResponseEntity.ok(engagementService.getEngagementScores(deptId));
    }
}
