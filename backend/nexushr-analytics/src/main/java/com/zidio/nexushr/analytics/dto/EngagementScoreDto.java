package com.zidio.nexushr.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EngagementScoreDto {
    private String departmentName;
    private double overallScore;
    private double attendanceQuality;
    private double goalProgress;
    private double feedbackScore;
    private double leaveHealth;
    private String trend; // POSITIVE, STABLE, DECLINING
    private int employeeCount;
}
