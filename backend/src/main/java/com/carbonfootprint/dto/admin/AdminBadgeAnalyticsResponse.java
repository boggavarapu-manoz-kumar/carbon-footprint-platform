package com.carbonfootprint.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminBadgeAnalyticsResponse {
    private long totalBadges;
    private long totalBadgesAwarded;

    private BadgeStat mostEarnedBadge;
    private BadgeStat leastEarnedBadge;

    private List<DistributionDataPoint> difficultyDistribution;
    private List<DistributionDataPoint> categoryDistribution;

    private List<TrendDataPoint> monthlyAwards;
    private List<TrendDataPoint> yearlyAwards;
    private List<TrendDataPoint> badgeGrowth; // cumulative growth or similar

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BadgeStat {
        private String name;
        private long count;
        private String imageUrl;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DistributionDataPoint {
        private String label;
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TrendDataPoint {
        private String label;
        private long count;
    }
}
