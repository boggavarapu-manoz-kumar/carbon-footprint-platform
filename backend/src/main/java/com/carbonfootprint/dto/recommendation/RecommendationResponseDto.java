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
public class RecommendationResponseDto {
    private String activity;
    private BigDecimal emission;
    private String impactLevel;
    private String recommendation;
    private BigDecimal potentialWeeklyReduction;
    private BigDecimal potentialMonthlyReduction;
    private BigDecimal potentialYearlyReduction;
    private BigDecimal reductionPercentageTarget;
    private String difficultyLevel;
    private Integer priorityScore;
}
