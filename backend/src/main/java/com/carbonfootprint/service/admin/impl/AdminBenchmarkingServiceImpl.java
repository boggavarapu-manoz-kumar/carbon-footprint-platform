package com.carbonfootprint.service.admin.impl;

import com.carbonfootprint.dto.admin.benchmarking.AdminBenchmarkingCategoryDto;
import com.carbonfootprint.dto.admin.benchmarking.AdminBenchmarkingDistributionDto;
import com.carbonfootprint.dto.admin.benchmarking.AdminBenchmarkingSummaryDto;
import com.carbonfootprint.dto.benchmarking.BenchmarkingStatsDto;
import com.carbonfootprint.dto.benchmarking.TrendDataPointDto;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.BenchmarkingService;
import com.carbonfootprint.service.admin.AdminBenchmarkingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminBenchmarkingServiceImpl implements AdminBenchmarkingService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final BenchmarkingService benchmarkingService;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "adminBenchmarkingStats", key = "'summary_' + (#year != null ? #year : 'ALL') + '_' + (#month != null ? #month : 'ALL')")
    public AdminBenchmarkingSummaryDto getPlatformBenchmarkingSummary(Integer year, Integer month) {
        LocalDate startDate = getStartDate(year, month);
        LocalDate endDate = getEndDate(year, month);

        List<Object[]> userSums;
        List<Object[]> categorySums;
        
        if (startDate == null || endDate == null) {
             userSums = activityLogRepository.sumEmissionsGroupedByUserAndDateRange(LocalDate.of(2000, 1, 1), LocalDate.now());
             categorySums = activityLogRepository.sumEmissionsGroupedByCategoryAndUserAndDateRange(LocalDate.of(2000, 1, 1), LocalDate.now());
        } else {
             userSums = activityLogRepository.sumEmissionsGroupedByUserAndDateRange(startDate, endDate);
             categorySums = activityLogRepository.sumEmissionsGroupedByCategoryAndUserAndDateRange(startDate, endDate);
        }

        List<BigDecimal> allEmissions = extractSums(userSums);
        BenchmarkingStatsDto platformStats = benchmarkingService.calculateStats(allEmissions);

        // Process Category Averages
        Map<String, List<BigDecimal>> categoryEmissionsMap = new java.util.HashMap<>();
        for (Object[] row : categorySums) {
            String category = (String) row[0];
            BigDecimal sum = (BigDecimal) row[2];
            if (sum == null) sum = BigDecimal.ZERO;
            categoryEmissionsMap.computeIfAbsent(category, k -> new ArrayList<>()).add(sum);
        }

        List<AdminBenchmarkingCategoryDto> categoryAverages = new ArrayList<>();
        String highestCat = "None";
        String lowestCat = "None";
        BigDecimal highestAvg = BigDecimal.valueOf(-1);
        BigDecimal lowestAvg = BigDecimal.valueOf(Double.MAX_VALUE);

        for (Map.Entry<String, List<BigDecimal>> entry : categoryEmissionsMap.entrySet()) {
            BenchmarkingStatsDto catStats = benchmarkingService.calculateStats(entry.getValue());
            
            categoryAverages.add(AdminBenchmarkingCategoryDto.builder()
                    .category(entry.getKey())
                    .averageEmissions(catStats.getAverage())
                    .totalUsersReporting(catStats.getTotalUsers())
                    .build());
            
            if (catStats.getAverage().compareTo(highestAvg) > 0) {
                highestAvg = catStats.getAverage();
                highestCat = entry.getKey();
            }
            if (catStats.getAverage().compareTo(lowestAvg) < 0 && catStats.getAverage().compareTo(BigDecimal.ZERO) > 0) {
                lowestAvg = catStats.getAverage();
                lowestCat = entry.getKey();
            }
        }

        long activeUsers = userRepository.count();

        return AdminBenchmarkingSummaryDto.builder()
                .platformAverageCarbon(platformStats.getAverage())
                .platformMedianCarbon(platformStats.getMedian())
                .highestCategory(highestCat)
                .lowestCategory(lowestCat)
                .categoryAverages(categoryAverages)
                .totalActiveUsers(activeUsers)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "adminBenchmarkingStats", key = "'dist_' + (#year != null ? #year : 'ALL') + '_' + (#month != null ? #month : 'ALL')")
    public AdminBenchmarkingDistributionDto getPlatformBenchmarkingDistribution(Integer year, Integer month) {
        LocalDate startDate = getStartDate(year, month);
        LocalDate endDate = getEndDate(year, month);

        List<Object[]> userSums;
        if (startDate == null || endDate == null) {
            userSums = activityLogRepository.sumEmissionsGroupedByUserAndDateRange(LocalDate.of(2000, 1, 1), LocalDate.now());
        } else {
            userSums = activityLogRepository.sumEmissionsGroupedByUserAndDateRange(startDate, endDate);
        }
        
        List<BigDecimal> allEmissions = extractSums(userSums);
        BenchmarkingStatsDto platformStats = benchmarkingService.calculateStats(allEmissions);
        Collections.sort(allEmissions);

        // Percentiles
        List<AdminBenchmarkingDistributionDto.PercentilePoint> percentiles = new ArrayList<>();
        percentiles.add(new AdminBenchmarkingDistributionDto.PercentilePoint("Top 10% (Best)", platformStats.getMinimum())); // lowest emitters
        percentiles.add(new AdminBenchmarkingDistributionDto.PercentilePoint("Top 25%", getPercentileVal(allEmissions, 25)));
        percentiles.add(new AdminBenchmarkingDistributionDto.PercentilePoint("Median (50%)", platformStats.getMedian()));
        percentiles.add(new AdminBenchmarkingDistributionDto.PercentilePoint("Bottom 25%", getPercentileVal(allEmissions, 75)));
        percentiles.add(new AdminBenchmarkingDistributionDto.PercentilePoint("Bottom 10% (Worst)", getPercentileVal(allEmissions, 90)));

        // Histogram Buckets (Fixed 5 buckets for simplicity based on min/max)
        List<AdminBenchmarkingDistributionDto.HistogramBucket> buckets = new ArrayList<>();
        if (!allEmissions.isEmpty()) {
            double max = platformStats.getMaximum().doubleValue();
            double step = max / 5.0;
            if (step == 0) step = 100;
            
            for (int i = 0; i < 5; i++) {
                final int index = i;
                final double lower = index * step;
                final double upper = (index + 1) * step;
                long count = allEmissions.stream().filter(val -> val.doubleValue() >= lower && (val.doubleValue() < upper || (index == 4 && val.doubleValue() <= upper))).count();
                buckets.add(new AdminBenchmarkingDistributionDto.HistogramBucket(
                        String.format("%.0f-%.0f kg", lower, upper), count
                ));
            }
        }

        return AdminBenchmarkingDistributionDto.builder()
                .percentileDistribution(percentiles)
                .carbonHistogram(buckets)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrendDataPointDto> getPlatformBenchmarkingTrends(Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        List<TrendDataPointDto> trends = new ArrayList<>();

        for (int i = 1; i <= 12; i++) {
            LocalDate start = LocalDate.of(targetYear, i, 1);
            LocalDate end = YearMonth.of(targetYear, i).atEndOfMonth();
            
            if (start.isAfter(LocalDate.now())) break;

            List<Object[]> userSums = activityLogRepository.sumEmissionsGroupedByUserAndDateRange(start, end);
            List<BigDecimal> allEmissions = extractSums(userSums);
            BenchmarkingStatsDto stats = benchmarkingService.calculateStats(allEmissions);

            trends.add(TrendDataPointDto.builder()
                    .period(start.getMonth().toString().substring(0, 3))
                    .platformAverage(stats.getAverage())
                    .build());
        }

        return trends;
    }

    private List<BigDecimal> extractSums(List<Object[]> sums) {
        return sums.stream().map(row -> {
            BigDecimal sum = (BigDecimal) row[1];
            return sum != null ? sum : BigDecimal.ZERO;
        }).collect(Collectors.toList());
    }

    private LocalDate getStartDate(Integer year, Integer month) {
        if (year == null) return null;
        if (month == null) return LocalDate.of(year, 1, 1);
        return LocalDate.of(year, month, 1);
    }

    private LocalDate getEndDate(Integer year, Integer month) {
        if (year == null) return null;
        if (month == null) return LocalDate.of(year, 12, 31);
        return YearMonth.of(year, month).atEndOfMonth();
    }

    private BigDecimal getPercentileVal(List<BigDecimal> sortedData, double percentile) {
        if (sortedData.isEmpty()) return BigDecimal.ZERO;
        double index = (percentile / 100.0) * (sortedData.size() - 1);
        int lower = (int) Math.floor(index);
        int upper = (int) Math.ceil(index);
        if (lower == upper) return sortedData.get(lower);
        BigDecimal lowerVal = sortedData.get(lower);
        BigDecimal upperVal = sortedData.get(upper);
        BigDecimal weight = BigDecimal.valueOf(index - lower);
        return lowerVal.add(upperVal.subtract(lowerVal).multiply(weight)).setScale(2, RoundingMode.HALF_UP);
    }
}
