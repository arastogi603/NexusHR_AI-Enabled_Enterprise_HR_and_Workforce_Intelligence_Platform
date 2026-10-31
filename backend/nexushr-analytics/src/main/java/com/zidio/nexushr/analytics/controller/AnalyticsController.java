package com.zidio.nexushr.analytics.controller;

import com.zidio.nexushr.analytics.dto.DashboardDto;
import com.zidio.nexushr.analytics.service.AIInsightService;
import com.zidio.nexushr.analytics.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final DashboardService dashboardService;
    private final AIInsightService aiInsightService;

    public AnalyticsController(DashboardService dashboardService, AIInsightService aiInsightService) {
        this.dashboardService = dashboardService;
        this.aiInsightService = aiInsightService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MANAGER', 'EXECUTIVE')")
    public ResponseEntity<DashboardDto> getDashboardMetrics() {
        return ResponseEntity.ok(dashboardService.getAdminDashboardMetrics());
    }

    @GetMapping("/insights/ai")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getAiInsights() {
        String insights = aiInsightService.generateStrategicInsights();
        return ResponseEntity.ok(Map.of("insights", insights));
    }
}
