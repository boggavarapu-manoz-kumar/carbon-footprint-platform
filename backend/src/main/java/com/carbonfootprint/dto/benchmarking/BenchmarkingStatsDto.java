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
public class BenchmarkingStatsDto {
    private BigDecimal average;
    private BigDecimal median;
    private BigDecimal top10Percentile;
    private BigDecimal top25Percentile;
    private BigDecimal top50Percentile;
    private BigDecimal minimum;
    private BigDecimal maximum;
    private BigDecimal standardDeviation;
    private Long totalUsers;
}
