package com.zidio.nexushr.performance.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class GoalDto {
    private UUID id;
    
    @NotNull(message = "Employee ID is required")
    private UUID employeeId;
    
    private String employeeName;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    private String status;
    
    @Min(0) @Max(100)
    private Integer completionPercentage;
}
