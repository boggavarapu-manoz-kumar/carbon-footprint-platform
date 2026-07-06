package com.carbonfootprint.dto.activity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsDto {
    private BigDecimal totalEmissions;
    private Long totalActivities;
    private BigDecimal currentMonthEmissions;
    private BigDecimal previousMonthEmissions;
    private BigDecimal weeklyEmissions;
    private Integer sustainabilityScore;
    private Map<String, BigDecimal> emissionsByCategory;
}
