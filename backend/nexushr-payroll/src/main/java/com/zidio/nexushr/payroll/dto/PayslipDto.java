package com.zidio.nexushr.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayslipDto {
    private UUID id;
    private UUID payrollRunId;
    private UUID employeeId;
    private String employeeName;
    private String employeeCode;
    private String designation;
    private String departmentName;
    private int month;
    private int year;
    private BigDecimal annualCtc;
    private int paidDays;
    private int lopDays;

    // Earnings
    private BigDecimal basic;
    private BigDecimal hra;
    private BigDecimal transportAllowance;
    private BigDecimal specialAllowance;
    private BigDecimal grossEarnings;

    // Deductions
    private BigDecimal pfDeduction;
    private BigDecimal esiDeduction;
    private BigDecimal ptDeduction;
    private BigDecimal tdsTax;
    private BigDecimal totalDeductions;
    private BigDecimal netSalary;

    private String status;
    private LocalDateTime createdAt;
}
