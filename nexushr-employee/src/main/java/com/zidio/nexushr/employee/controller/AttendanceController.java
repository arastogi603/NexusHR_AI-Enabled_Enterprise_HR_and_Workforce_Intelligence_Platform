package com.zidio.nexushr.employee.controller;

import com.zidio.nexushr.employee.dto.AttendanceDto;
import com.zidio.nexushr.employee.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/clock-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<AttendanceDto> clockIn(Authentication authentication) {
        return ResponseEntity.ok(attendanceService.clockIn(authentication.getName()));
    }

    @PostMapping("/clock-out")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<AttendanceDto> clockOut(Authentication authentication) {
        return ResponseEntity.ok(attendanceService.clockOut(authentication.getName()));
    }

    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<AttendanceDto> getTodayAttendance(Authentication authentication) {
        return ResponseEntity.ok(attendanceService.getTodayAttendance(authentication.getName()));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<AttendanceDto>> getAttendanceHistory(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(attendanceService.getAttendanceHistory(authentication.getName(), from, to));
    }

    @GetMapping("/team")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AttendanceDto>> getTeamAttendance(
            @RequestParam UUID departmentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(attendanceService.getDepartmentAttendance(departmentId, queryDate));
    }
}
