package com.zidio.nexushr.employee.controller;

import com.zidio.nexushr.employee.dto.LeaveDto;
import com.zidio.nexushr.employee.dto.LeaveRequest;
import com.zidio.nexushr.employee.entity.LeaveBalance;
import com.zidio.nexushr.employee.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<LeaveDto> applyForLeave(Authentication authentication, @Valid @RequestBody LeaveRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveService.applyForLeave(authentication.getName(), request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<LeaveDto>> getMyLeaves(Authentication authentication) {
        return ResponseEntity.ok(leaveService.getMyLeaves(authentication.getName()));
    }

    @GetMapping("/balance")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<LeaveBalance> getMyLeaveBalance(
            Authentication authentication,
            @RequestParam(required = false) Integer year) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(leaveService.getLeaveBalance(authentication.getName(), targetYear));
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<LeaveDto>> getPendingLeavesForManager(Authentication authentication) {
        return ResponseEntity.ok(leaveService.getPendingLeavesForManager(authentication.getName()));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<LeaveDto> approveLeave(Authentication authentication, @PathVariable UUID id) {
        return ResponseEntity.ok(leaveService.processLeaveRequest(authentication.getName(), id, true));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<LeaveDto> rejectLeave(Authentication authentication, @PathVariable UUID id) {
        return ResponseEntity.ok(leaveService.processLeaveRequest(authentication.getName(), id, false));
    }
}
