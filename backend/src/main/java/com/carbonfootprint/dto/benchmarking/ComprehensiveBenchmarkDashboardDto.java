package com.carbonfootprint.dto.benchmarking;

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
public class ComprehensiveBenchmarkDashboardDto {
    // Overall Stats
    private String overallStanding; // e.g., "Excellent", "Needs Work"
    private BigDecimal platformAverage;
    private BigDecimal userTotalEmissions;
    
    // Percentiles & Ranks
    private BigDecimal overallPercentile;
    private BigDecimal weeklyPercentile;
    private BigDecimal monthlyPercentile;
    
    // Goals Integration
    private boolean hasActiveGoal;
    private BigDecimal goalProgress; // Percentage to goal
    private String goalTarget; 
    
    // Time Series Trend
    private List<TrendDataPointDto> trendData;
    
    // Distribution (Bell Curve) Data
    private BenchmarkingStatsDto globalStats;
    
    // Categories
    private List<CategoryBenchmarkDto> categoryBenchmarks;
}
