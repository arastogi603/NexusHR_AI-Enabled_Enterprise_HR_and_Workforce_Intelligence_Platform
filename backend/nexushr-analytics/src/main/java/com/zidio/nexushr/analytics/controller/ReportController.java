package com.zidio.nexushr.analytics.controller;

import com.zidio.nexushr.analytics.service.ReportExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/analytics/reports")
public class ReportController {

    private final ReportExportService reportExportService;

    public ReportController(ReportExportService reportExportService) {
        this.reportExportService = reportExportService;
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXECUTIVE')")
    public ResponseEntity<byte[]> exportReport(@RequestParam(defaultValue = "CSV") String type) {
        byte[] data;
        String filename;
        String contentType;

        if ("TEXT".equalsIgnoreCase(type)) {
            data = reportExportService.generateExecutiveTextReport();
            filename = "NexusHR_Executive_Brief_" + LocalDate.now() + ".txt";
            contentType = "text/plain";
        } else {
            data = reportExportService.generateCsvReport();
            filename = "NexusHR_Workforce_Metrics_" + LocalDate.now() + ".csv";
            contentType = "text/csv";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDispositionFormData("attachment", filename);

        return ResponseEntity.ok()
                .headers(headers)
                .body(data);
    }
}
