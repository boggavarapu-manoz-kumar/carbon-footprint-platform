package com.carbonfootprint.dto.analytics;

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
public class AnalyticsResponseDto {
    private String timePeriod; // e.g. "2026-07-09", "Week 28", "July 2026", "2026"
    private BigDecimal totalEmissions;
    private Long totalActivities;
    private Double periodOverPeriodChange; // % change from previous period
    private List<CategoryShareDto> categoryShares;
    private List<TimeSeriesDataPointDto> timeline;
    private List<DailyTimelineActivityDto> rawActivities;
}
