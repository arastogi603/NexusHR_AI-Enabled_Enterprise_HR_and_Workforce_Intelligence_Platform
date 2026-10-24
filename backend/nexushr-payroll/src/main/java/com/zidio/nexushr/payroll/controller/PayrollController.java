package com.zidio.nexushr.payroll.controller;

import com.zidio.nexushr.payroll.dto.*;
import com.zidio.nexushr.payroll.service.PayrollRunService;
import com.zidio.nexushr.payroll.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
    private final PayrollRunService payrollRunService;

    public PayrollController(PayrollService payrollService,
                             PayrollRunService payrollRunService) {
        this.payrollService = payrollService;
        this.payrollRunService = payrollRunService;
    }

    // =========================================================================
    // STATUTORY PAYROLL RUN LIFECYCLE (M5)
    // =========================================================================

    @PostMapping("/preview")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXECUTIVE')")
    public ResponseEntity<PayrollPreviewDto> previewPayroll(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(payrollRunService.previewPayroll(month, year));
    }

    @PostMapping("/run")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PayrollRunDto> executePayrollRun(
            @RequestParam int month,
            @RequestParam int year,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(payrollRunService.runPayroll(month, year, authentication.getName()));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PayrollRunDto> publishPayroll(
            @PathVariable UUID id,
            Authentication authentication) {
        return ResponseEntity.ok(payrollRunService.publishPayroll(id, authentication.getName()));
    }

    @GetMapping("/runs")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXECUTIVE')")
    public ResponseEntity<List<PayrollRunDto>> getAllRuns() {
        return ResponseEntity.ok(payrollRunService.getAllRuns());
    }

    @GetMapping("/runs/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXECUTIVE')")
    public ResponseEntity<PayrollRunDto> getRunDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(payrollRunService.getRunById(id));
    }

    @GetMapping("/payslips/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<PayslipDto>> getMyStatutoryPayslips(Authentication authentication) {
        return ResponseEntity.ok(payrollRunService.getMyPayslips(authentication.getName()));
    }

    @GetMapping("/payslips/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<PayslipDto> getPayslip(
            @PathVariable UUID id,
            Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN"));
        return ResponseEntity.ok(payrollRunService.getPayslipById(id, authentication.getName(), isAdmin));
    }

    @GetMapping("/payslips/{id}/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<byte[]> downloadPayslipPdf(
            @PathVariable UUID id,
            Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN"));
        byte[] pdfBytes = payrollRunService.generatePayslipPdf(id, authentication.getName(), isAdmin);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "payslip-" + id + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // =========================================================================
    // LEGACY ENDPOINTS (Preserved for backwards compatibility)
    // =========================================================================

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
