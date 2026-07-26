package com.carbonfootprint.service.admin;

import com.carbonfootprint.dto.admin.benchmarking.AdminBenchmarkingDistributionDto;
import com.carbonfootprint.dto.admin.benchmarking.AdminBenchmarkingSummaryDto;
import com.carbonfootprint.dto.benchmarking.TrendDataPointDto;

import java.util.List;

public interface AdminBenchmarkingService {
    
    /**
     * Retrieves the platform-wide benchmarking summary including average, median,
     * and category averages for a given time period (defaults to all time if null).
     */
    AdminBenchmarkingSummaryDto getPlatformBenchmarkingSummary(Integer year, Integer month);

    /**
     * Retrieves the distribution of carbon emissions across the platform,
     * including histogram buckets and percentile breakpoints.
     */
    AdminBenchmarkingDistributionDto getPlatformBenchmarkingDistribution(Integer year, Integer month);

    /**
     * Retrieves a monthly trend of platform averages for the specified year.
     */
    List<TrendDataPointDto> getPlatformBenchmarkingTrends(Integer year);
}
