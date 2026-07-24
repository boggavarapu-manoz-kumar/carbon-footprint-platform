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
public class TrendDataPointDto {
    private String period; // e.g., "Jan", "Feb", or "Week 1"
    private BigDecimal userEmissions;
    private BigDecimal platformAverage;
    private BigDecimal userPercentile;
}
