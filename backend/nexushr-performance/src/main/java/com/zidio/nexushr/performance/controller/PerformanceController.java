package com.zidio.nexushr.performance.controller;

import com.zidio.nexushr.performance.dto.GoalDto;
import com.zidio.nexushr.performance.dto.PerformanceReviewDto;
import com.zidio.nexushr.performance.service.PerformanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/performance")
public class PerformanceController {

    private final PerformanceService performanceService;

    public PerformanceController(PerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    @PostMapping("/goals")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<GoalDto> createGoal(Authentication authentication, @Valid @RequestBody GoalDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(performanceService.createGoal(authentication.getName(), request));
    }

    @PutMapping("/goals/{id}/progress")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<GoalDto> updateGoalProgress(
            Authentication authentication, 
            @PathVariable UUID id,
            @RequestParam int percentage,
            @RequestParam String status) {
        return ResponseEntity.ok(performanceService.updateGoalProgress(authentication.getName(), id, percentage, status));
    }

    @GetMapping("/employees/{employeeId}/goals")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<GoalDto>> getEmployeeGoals(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(performanceService.getEmployeeGoals(employeeId));
    }

    @PostMapping("/reviews")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PerformanceReviewDto> createReview(Authentication authentication, @Valid @RequestBody PerformanceReviewDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(performanceService.createReview(authentication.getName(), request));
    }

    @GetMapping("/employees/{employeeId}/reviews")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<PerformanceReviewDto>> getEmployeeReviews(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(performanceService.getEmployeeReviews(employeeId));
    }
}
