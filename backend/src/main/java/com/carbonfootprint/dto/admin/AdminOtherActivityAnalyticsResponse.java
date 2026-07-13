package com.carbonfootprint.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOtherActivityAnalyticsResponse {
    private Long totalActivities;
    private BigDecimal totalEmissions;
    
    private CustomActivityStatDTO mostUsedActivity;
    private CustomActivityStatDTO highestEmissionActivity;
    
    private List<CustomActivityStatDTO> topActivities;
    
    private List<TrendDataPoint> dailyTrends;
    private List<TrendDataPoint> weeklyTrends;
    private List<TrendDataPoint> monthlyTrends;
    private List<TrendDataPoint> yearlyTrends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendDataPoint {
        private String label;
        private Long activityCount;
        private BigDecimal totalEmissions;
    }
}
