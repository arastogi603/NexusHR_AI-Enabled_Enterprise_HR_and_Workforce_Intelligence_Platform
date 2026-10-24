package com.zidio.nexushr.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollPreviewDto {
    private int month;
    private int year;
    private int totalEmployees;
    private BigDecimal totalGross;
    private BigDecimal totalDeductions;
    private BigDecimal totalTax;
    private BigDecimal totalNet;
    private List<String> anomalies;
    private List<PayslipDto> previewItems;
}
