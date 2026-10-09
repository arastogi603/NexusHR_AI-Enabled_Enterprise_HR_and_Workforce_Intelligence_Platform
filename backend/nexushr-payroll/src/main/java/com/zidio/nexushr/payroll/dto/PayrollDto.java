package com.zidio.nexushr.payroll.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PayrollDto {
    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private String employeeCode;
    private LocalDate payPeriodStart;
    private LocalDate payPeriodEnd;
    private BigDecimal baseSalary;
    private BigDecimal allowances;
    private BigDecimal deductions;
    private BigDecimal tax;
    private BigDecimal netSalary;
    private String status;
    private LocalDateTime processedDate;
    private String remarks;
}
