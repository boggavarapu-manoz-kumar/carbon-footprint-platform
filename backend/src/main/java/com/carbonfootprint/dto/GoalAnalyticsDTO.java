package com.carbonfootprint.dto;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class GoalAnalyticsDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long goalId;
    private BigDecimal currentProgress;
    private BigDecimal targetEmission;
    private BigDecimal progressPercent;
    
    private Long remainingDays;
    private Long totalDays;
    
    private BigDecimal weeklyProgress;
    
    private List<TimelineDataPoint> timeline;
    private List<CategoryShare> categoryShares;
    
    @Data
    @Builder
    public static class TimelineDataPoint implements Serializable {
        private String date; // ISO Date String
        private BigDecimal cumulativeEmissions;
        private BigDecimal idealBurn; // Expected linear burn down
    }
    
    @Data
    @Builder
    public static class CategoryShare implements Serializable {
        private String category;
        private BigDecimal emissions;
        private BigDecimal percentage;
    }
}
