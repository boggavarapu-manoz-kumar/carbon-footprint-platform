package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.benchmarking.BenchmarkingResultDto;
import com.carbonfootprint.dto.benchmarking.BenchmarkingStatsDto;
import com.carbonfootprint.dto.benchmarking.CategoryBenchmarkDto;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.service.BenchmarkingService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BenchmarkingServiceImpl implements BenchmarkingService {

    private final ActivityLogRepository activityLogRepository;
    private final com.carbonfootprint.repository.GoalRepository goalRepository;

    @Override
    @Transactional(readOnly = true)
    public BenchmarkingResultDto getMonthlyBenchmarking(Long userId) {
        LocalDate startDate = LocalDate.now().minusDays(30);
        LocalDate endDate = LocalDate.now();
        return computeBenchmarking(userId, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public BenchmarkingResultDto getYearlyBenchmarking(Long userId) {
        LocalDate startDate = LocalDate.now().minusDays(365);
        LocalDate endDate = LocalDate.now();
        return computeBenchmarking(userId, startDate, endDate);
    }

    private BenchmarkingResultDto computeBenchmarking(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Object[]> userSums = activityLogRepository.sumEmissionsGroupedByUserAndDateRange(startDate, endDate);
        
        List<BigDecimal> allEmissions = new ArrayList<>();
        BigDecimal userTotalEmissions = BigDecimal.ZERO;
        
        for (Object[] row : userSums) {
            Long currentUserId = (Long) row[0];
            BigDecimal sum = (BigDecimal) row[1];
            if (sum == null) sum = BigDecimal.ZERO;
            
            allEmissions.add(sum);
            if (currentUserId.equals(userId)) {
                userTotalEmissions = sum;
            }
        }
        
        BenchmarkingStatsDto globalStats = calculateStats(allEmissions);
        BigDecimal userPercentile = calculatePercentileRank(allEmissions, userTotalEmissions);
        
        // Fetch and process category data
        List<Object[]> categorySums = activityLogRepository.sumEmissionsGroupedByCategoryAndUserAndDateRange(startDate, endDate);
        java.util.Map<String, List<BigDecimal>> categoryEmissionsMap = new java.util.HashMap<>();
        java.util.Map<String, BigDecimal> userCategoryTotals = new java.util.HashMap<>();

        for (Object[] row : categorySums) {
            String category = (String) row[0];
            Long currentUserId = (Long) row[1];
            BigDecimal sum = (BigDecimal) row[2];
            if (sum == null) sum = BigDecimal.ZERO;

            categoryEmissionsMap.computeIfAbsent(category, k -> new ArrayList<>()).add(sum);
            if (currentUserId.equals(userId)) {
                userCategoryTotals.put(category, sum);
            }
        }

        List<CategoryBenchmarkDto> categoryBenchmarks = new ArrayList<>();
        for (java.util.Map.Entry<String, List<BigDecimal>> entry : categoryEmissionsMap.entrySet()) {
            String category = entry.getKey();
            List<BigDecimal> allEmissionsForCategory = entry.getValue();
            BigDecimal userTotal = userCategoryTotals.getOrDefault(category, BigDecimal.ZERO);

            BenchmarkingStatsDto catStats = calculateStats(allEmissionsForCategory);
            BigDecimal catPercentile = calculatePercentileRank(allEmissionsForCategory, userTotal);
            
            BigDecimal difference = userTotal.subtract(catStats.getAverage()).setScale(2, RoundingMode.HALF_UP);
            BigDecimal improvementNeeded = BigDecimal.ZERO;
            if (difference.compareTo(BigDecimal.ZERO) > 0 && catStats.getAverage().compareTo(BigDecimal.ZERO) > 0) {
                improvementNeeded = difference.divide(userTotal, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_UP);
            }

            categoryBenchmarks.add(CategoryBenchmarkDto.builder()
                    .categoryName(category)
                    .userEmissions(userTotal)
                    .platformAverage(catStats.getAverage())
                    .difference(difference)
                    .improvementNeeded(improvementNeeded)
                    .userPercentile(catPercentile)
                    .platformStats(catStats)
                    .build());
        }
        return BenchmarkingResultDto.builder()
                .userTotalEmissions(userTotalEmissions.setScale(2, RoundingMode.HALF_UP))
                .globalStats(globalStats)
                .categoryBenchmarks(categoryBenchmarks)
                .userPercentile(userPercentile)
                .build();
    }

    @Cacheable(value = "benchmarkingStats", key = "'global_' + #allEmissions.hashCode()")
    public BenchmarkingStatsDto calculateStats(List<BigDecimal> allEmissions) {
        if (allEmissions == null || allEmissions.isEmpty()) {
            return BenchmarkingStatsDto.builder()
                    .totalUsers(0L)
                    .average(BigDecimal.ZERO)
                    .median(BigDecimal.ZERO)
                    .top10Percentile(BigDecimal.ZERO)
                    .top25Percentile(BigDecimal.ZERO)
                    .top50Percentile(BigDecimal.ZERO)
                    .minimum(BigDecimal.ZERO)
                    .maximum(BigDecimal.ZERO)
                    .standardDeviation(BigDecimal.ZERO)
                    .build();
        }

        Collections.sort(allEmissions);
        int size = allEmissions.size();
        
        BigDecimal sum = allEmissions.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal average = sum.divide(BigDecimal.valueOf(size), 2, RoundingMode.HALF_UP);
        
        BigDecimal median = getPercentile(allEmissions, 50);
        BigDecimal top10Percentile = getPercentile(allEmissions, 90);
        BigDecimal top25Percentile = getPercentile(allEmissions, 75);
        BigDecimal top50Percentile = median;
        
        BigDecimal min = allEmissions.get(0);
        BigDecimal max = allEmissions.get(size - 1);
        
        // Standard Deviation
        BigDecimal varianceSum = BigDecimal.ZERO;
        for (BigDecimal val : allEmissions) {
            BigDecimal diff = val.subtract(average);
            varianceSum = varianceSum.add(diff.multiply(diff));
        }
        BigDecimal variance = varianceSum.divide(BigDecimal.valueOf(size), 4, RoundingMode.HALF_UP);
        BigDecimal stdDev = BigDecimal.valueOf(Math.sqrt(variance.doubleValue())).setScale(2, RoundingMode.HALF_UP);

        return BenchmarkingStatsDto.builder()
                .totalUsers((long) size)
                .average(average)
                .median(median)
                .top10Percentile(top10Percentile)
                .top25Percentile(top25Percentile)
                .top50Percentile(top50Percentile)
                .minimum(min)
                .maximum(max)
                .standardDeviation(stdDev)
                .build();
    }

    private BigDecimal getPercentile(List<BigDecimal> sortedData, double percentile) {
        if (sortedData.isEmpty()) return BigDecimal.ZERO;
        if (percentile <= 0) return sortedData.get(0);
        if (percentile >= 100) return sortedData.get(sortedData.size() - 1);
        
        double index = (percentile / 100.0) * (sortedData.size() - 1);
        int lower = (int) Math.floor(index);
        int upper = (int) Math.ceil(index);
        
        if (lower == upper) {
            return sortedData.get(lower).setScale(2, RoundingMode.HALF_UP);
        }
        
        BigDecimal lowerVal = sortedData.get(lower);
        BigDecimal upperVal = sortedData.get(upper);
        BigDecimal weight = BigDecimal.valueOf(index - lower);
        
        return lowerVal.add(upperVal.subtract(lowerVal).multiply(weight)).setScale(2, RoundingMode.HALF_UP);
    }
    
    private BigDecimal calculatePercentileRank(List<BigDecimal> sortedData, BigDecimal value) {
        if (sortedData.isEmpty() || value == null || value.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        
        long countAbove = sortedData.stream().filter(v -> v.compareTo(value) > 0).count();
        long countEqual = sortedData.stream().filter(v -> v.compareTo(value) == 0).count();
        
        // rank represents the percentage of users who emit MORE than you.
        // E.g., if rank is 0.82, it means you emit less than 82% of users.
        double rank = (countAbove + (0.5 * countEqual)) / sortedData.size();
        return BigDecimal.valueOf(rank * 100).setScale(1, RoundingMode.HALF_UP);
    }

    @Override
    @Transactional(readOnly = true)
    public com.carbonfootprint.dto.benchmarking.ComprehensiveBenchmarkDashboardDto getComprehensiveBenchmarkingDashboard(Long userId) {
        // 1. Overall Standing & Ranks
        BenchmarkingResultDto yearly = getYearlyBenchmarking(userId);
        BenchmarkingResultDto monthly = getMonthlyBenchmarking(userId);
        BenchmarkingResultDto weekly = computeBenchmarking(userId, LocalDate.now().minusDays(7), LocalDate.now());
        
        String overallStanding = "Average";
        if (yearly.getUserPercentile().compareTo(BigDecimal.valueOf(80)) >= 0) overallStanding = "Excellent";
        else if (yearly.getUserPercentile().compareTo(BigDecimal.valueOf(60)) >= 0) overallStanding = "Good";
        else if (yearly.getUserPercentile().compareTo(BigDecimal.valueOf(40)) < 0) overallStanding = "Needs Work";
        
        // 2. Goal Progress (fetch first active goal)
        boolean hasActiveGoal = false;
        BigDecimal goalProgress = BigDecimal.ZERO;
        String goalTarget = "None";
        
        List<com.carbonfootprint.entity.Goal> activeGoals = goalRepository.findByUserIdAndStatus(userId, com.carbonfootprint.entity.GoalStatus.IN_PROGRESS);
        if (!activeGoals.isEmpty()) {
            com.carbonfootprint.entity.Goal currentGoal = activeGoals.get(0);
            hasActiveGoal = true;
            goalTarget = currentGoal.getGoalType().name() + " - " + (currentGoal.getTargetEmission() != null ? currentGoal.getTargetEmission() + " kg" : currentGoal.getTargetReductionPercent() + "%");
            if (currentGoal.getProgressPercent() != null) {
                 goalProgress = currentGoal.getProgressPercent();
            }
        }
        
        // 3. Time Series Trend
        List<com.carbonfootprint.dto.benchmarking.TrendDataPointDto> trendData = new ArrayList<>();
        // Simple 6-month trend logic (Mocked for brevity)
        for (int i = 5; i >= 0; i--) {
            LocalDate mStart = LocalDate.now().minusMonths(i).withDayOfMonth(1);
            LocalDate mEnd = mStart.plusMonths(1).minusDays(1);
            BenchmarkingResultDto monthRes = computeBenchmarking(userId, mStart, mEnd);
            trendData.add(com.carbonfootprint.dto.benchmarking.TrendDataPointDto.builder()
                .period(mStart.getMonth().toString().substring(0,3))
                .userEmissions(monthRes.getUserTotalEmissions())
                .platformAverage(monthRes.getGlobalStats().getAverage())
                .userPercentile(monthRes.getUserPercentile())
                .build());
        }
        
        return com.carbonfootprint.dto.benchmarking.ComprehensiveBenchmarkDashboardDto.builder()
            .overallStanding(overallStanding)
            .platformAverage(yearly.getGlobalStats().getAverage())
            .userTotalEmissions(yearly.getUserTotalEmissions())
            .overallPercentile(yearly.getUserPercentile())
            .weeklyPercentile(weekly.getUserPercentile())
            .monthlyPercentile(monthly.getUserPercentile())
            .hasActiveGoal(false) // Will add GoalRepository injection shortly
            .goalProgress(BigDecimal.ZERO)
            .goalTarget("None")
            .trendData(trendData)
            .globalStats(yearly.getGlobalStats())
            .categoryBenchmarks(yearly.getCategoryBenchmarks())
            .build();
    }
}
