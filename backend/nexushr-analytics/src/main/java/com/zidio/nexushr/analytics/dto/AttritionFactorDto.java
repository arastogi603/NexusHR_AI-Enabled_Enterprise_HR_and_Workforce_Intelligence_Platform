package com.zidio.nexushr.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttritionFactorDto {
    private String factor;
    private int weight;
    private double subScore;
    private double contribution;
    private String explanation;
}
