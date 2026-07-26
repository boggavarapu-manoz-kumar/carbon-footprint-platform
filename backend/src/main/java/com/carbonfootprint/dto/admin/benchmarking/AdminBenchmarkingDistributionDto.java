package com.carbonfootprint.dto.admin.benchmarking;

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
public class AdminBenchmarkingDistributionDto {
    private List<HistogramBucket> carbonHistogram;
    private List<PercentilePoint> percentileDistribution;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistogramBucket {
        private String rangeLabel; // e.g., "0 - 100 kg"
        private Long userCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PercentilePoint {
        private String percentile; // e.g., "Top 10%", "Median"
        private BigDecimal thresholdValue; // emission value for this percentile
    }
}
