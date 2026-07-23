package com.carbonfootprint.dto;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class GoalPredictionDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private BigDecimal currentCarbon;
    private BigDecimal targetCarbon;
    private BigDecimal remainingCarbon;
    private Long daysRemaining;
    private BigDecimal averageDailyEmission;
    private BigDecimal averageWeeklyEmission;
    private BigDecimal currentReductionRate;
    private BigDecimal projectedFinalCarbon;
    private LocalDate projectedCompletionDate;
    private String predictionStatus; // ON_TRACK, AHEAD_OF_SCHEDULE, SLIGHTLY_BEHIND, BEHIND_SCHEDULE, ACHIEVED, FAILED
}
