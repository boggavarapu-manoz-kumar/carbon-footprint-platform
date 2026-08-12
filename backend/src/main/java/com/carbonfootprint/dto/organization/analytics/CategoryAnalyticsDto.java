package com.carbonfootprint.dto.organization.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryAnalyticsDto {
    private String category; // e.g., "Transport", "Electricity"
    private Double totalEmissions;
    private Double percentage;
    private Double previousPeriodEmissions;
    private Double percentageChange; // Positive implies increase (bad), negative implies decrease (good)
}
