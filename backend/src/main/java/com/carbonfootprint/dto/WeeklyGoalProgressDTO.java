package com.carbonfootprint.dto;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
public class WeeklyGoalProgressDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private BigDecimal currentWeekCarbon;
    private BigDecimal previousWeekCarbon;
    private BigDecimal goalTarget;
    private BigDecimal weeklyReduction;
    private BigDecimal remainingReduction;
    private BigDecimal progressPercent;
    private BigDecimal weeklyImprovementPercent;
    private BigDecimal carbonSaved;
    private BigDecimal remainingCarbon;
}
