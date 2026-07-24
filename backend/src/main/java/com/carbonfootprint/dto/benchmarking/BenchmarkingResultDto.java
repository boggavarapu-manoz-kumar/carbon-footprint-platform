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
public class BenchmarkingResultDto {
    private BigDecimal userTotalEmissions;
    private BenchmarkingStatsDto globalStats;
    private List<CategoryBenchmarkDto> categoryBenchmarks;
    private BigDecimal userPercentile; // Where the user ranks (e.g., top 15%)
}
