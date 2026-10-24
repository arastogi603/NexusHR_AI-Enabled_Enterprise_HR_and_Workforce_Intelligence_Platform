package com.zidio.nexushr.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillGapDto {
    private String departmentName;
    private String designation;
    private String skill;
    private int requiredLevel;
    private double currentProficiency;
    private double gap;
    private int criticality;
    private double priorityScore;
    private String suggestedTraining;
}
