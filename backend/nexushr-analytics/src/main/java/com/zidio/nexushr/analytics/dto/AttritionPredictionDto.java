package com.zidio.nexushr.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttritionPredictionDto {
    private UUID employeeId;
    private String employeeCode;
    private String employeeName;
    private String departmentName;
    private String designation;
    private double riskScore;
    private String riskLevel; // LOW, MEDIUM, HIGH
    private List<AttritionFactorDto> contributingFactors;
    private List<String> recommendedActions;
    private String narrative;
    private String source; // RULES, LLM
    private LocalDateTime generatedAt;
}
