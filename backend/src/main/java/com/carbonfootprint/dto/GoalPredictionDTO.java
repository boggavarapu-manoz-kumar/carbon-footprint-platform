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

    private String predictionStatus; // ON_TRACK, SLIGHTLY_BEHIND, BEHIND_SCHEDULE, ACHIEVED, FAILED
    private LocalDate expectedCompletionDate;
    private BigDecimal projectedCarbon;
    private BigDecimal probabilityOfSuccess;
    private BigDecimal confidenceScore;
}
