package com.carbonfootprint.service;

import com.carbonfootprint.dto.benchmarking.BenchmarkingResultDto;

public interface BenchmarkingService {
    BenchmarkingResultDto getMonthlyBenchmarking(Long userId);
    BenchmarkingResultDto getYearlyBenchmarking(Long userId);
    com.carbonfootprint.dto.benchmarking.ComprehensiveBenchmarkDashboardDto getComprehensiveBenchmarkingDashboard(Long userId);
}
