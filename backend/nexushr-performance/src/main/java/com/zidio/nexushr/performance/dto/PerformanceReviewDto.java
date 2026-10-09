package com.zidio.nexushr.performance.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PerformanceReviewDto {
    private UUID id;
    
    @NotNull(message = "Employee ID is required")
    private UUID employeeId;
    private String employeeName;
    
    private UUID reviewerId;
    private String reviewerName;
    
    @NotBlank(message = "Review period is required")
    private String reviewPeriod;
    
    @NotNull(message = "Score is required")
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "5.0")
    private BigDecimal score;
    
    private String feedback;
    private String status;
}
