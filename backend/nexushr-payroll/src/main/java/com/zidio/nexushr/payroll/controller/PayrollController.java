package com.zidio.nexushr.payroll.controller;

import com.zidio.nexushr.payroll.dto.PayrollDto;
import com.zidio.nexushr.payroll.dto.PayrollRequest;
import com.zidio.nexushr.payroll.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PayrollDto> generatePayroll(@Valid @RequestBody PayrollRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(payrollService.generatePayroll(request));
    }

    @PostMapping("/generate/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PayrollDto>> generateBatchPayroll(@Valid @RequestBody List<PayrollRequest> requests) {
        return ResponseEntity.status(HttpStatus.CREATED).body(payrollService.generateBatchPayroll(requests));
    }

    @GetMapping("/my-payslips")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<PayrollDto>> getMyPayslips(Authentication authentication) {
        return ResponseEntity.ok(payrollService.getEmployeePayslips(authentication.getName()));
    }

    @PutMapping("/{id}/mark-paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> markAsPaid(@PathVariable UUID id) {
        payrollService.markAsPaid(id);
        return ResponseEntity.noContent().build();
    }
}
