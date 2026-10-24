package com.zidio.nexushr.gateway.controller;

import com.zidio.nexushr.gateway.config.DemoDataSeeder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class SystemController {

    private final DemoDataSeeder demoDataSeeder;

    public SystemController(DemoDataSeeder demoDataSeeder) {
        this.demoDataSeeder = demoDataSeeder;
    }

    @GetMapping({"/", "/health", "/api/v1/health", "/api/v1/system/health"})
    public ResponseEntity<Map<String, Object>> getHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "NexusHR Enterprise Platform",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @PostMapping("/api/v1/system/demo/reset")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> resetDemoData() {
        demoDataSeeder.seedData();
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Demo environment reset and seeded successfully with default organizational data."
        ));
    }

    @GetMapping({"/api/v1/system/config", "/api/v1/config"})
    public ResponseEntity<Map<String, Object>> getSystemConfig() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "version", "2.0.0-PROD",
                "environment", "production",
                "statutoryRegime", "FY 2025-26 New Tax Regime (Section 115BAC)",
                "timezone", "Asia/Kolkata",
                "realtimeEngine", "STOMP WebSocket with Redis Pub/Sub",
                "aiProvider", "RULES"
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "NexusHR Enterprise Gateway",
                "timestamp", System.currentTimeMillis()
        ));
    }
}
