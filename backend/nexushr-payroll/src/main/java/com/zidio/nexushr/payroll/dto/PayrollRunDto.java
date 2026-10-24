package com.zidio.nexushr.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRunDto {
    private UUID id;
    private int month;
    private int year;
    private String status;
    private BigDecimal totalGross;
    private BigDecimal totalDeductions;
    private BigDecimal totalTax;
    private BigDecimal totalNet;
    private int totalEmployees;
    private LocalDateTime publishedAt;
    private String remarks;
    private LocalDateTime createdAt;
    private List<PayslipDto> payslips;
}
