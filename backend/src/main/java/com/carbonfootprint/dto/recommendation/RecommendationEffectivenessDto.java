package com.carbonfootprint.dto.recommendation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationEffectivenessDto {
    private String category;
    private BigDecimal beforeEmission;
    private BigDecimal afterEmission;
    private BigDecimal emissionReduction;
    private BigDecimal progressPercentage;
    private Integer improvementScore;
    private String status; // "SUCCESS" or "FAILURE"
}
