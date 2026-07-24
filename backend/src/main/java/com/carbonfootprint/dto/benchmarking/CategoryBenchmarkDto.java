package com.carbonfootprint.dto.benchmarking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryBenchmarkDto {
    private String categoryName;
    private BigDecimal userEmissions;
    private BigDecimal platformAverage;
    private BigDecimal difference;
    private BigDecimal improvementNeeded;
    private BigDecimal userPercentile;
    private BenchmarkingStatsDto platformStats;
}
