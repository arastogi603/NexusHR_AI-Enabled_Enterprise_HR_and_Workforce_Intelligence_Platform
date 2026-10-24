package com.zidio.nexushr.analytics.controller;

import com.zidio.nexushr.analytics.dto.SkillGapDto;
import com.zidio.nexushr.analytics.service.SkillGapService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics/skills")
public class SkillGapController {

    private final SkillGapService skillGapService;

    public SkillGapController(SkillGapService skillGapService) {
        this.skillGapService = skillGapService;
    }

    @GetMapping("/gaps")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXECUTIVE', 'MANAGER')")
    public ResponseEntity<List<SkillGapDto>> getSkillGaps(@RequestParam(required = false) UUID deptId) {
        return ResponseEntity.ok(skillGapService.getSkillGaps(deptId));
    }
}
