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
    
    private GoalIntelligence intelligence;

    @Data
    @Builder
    public static class TimelineDataPoint implements Serializable {
        private String label; // "Goal Created", "Week 1", etc.
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
        private String trend; // "INCREASE", "DECREASE", "STABLE"
        private BigDecimal trendValue;
    }

    @Data
    @Builder
    public static class GoalIntelligence implements Serializable {
        private String highestEmissionCategory;
        private String lowestEmissionCategory;
        private String mostImprovedCategory;
        private String worstCategory;
        
        private List<String> topPriorityActions;
        private List<String> mediumPriorityActions;
        private List<String> lowPriorityActions;
        
        private List<String> personalizedSuggestions;
    }
}
