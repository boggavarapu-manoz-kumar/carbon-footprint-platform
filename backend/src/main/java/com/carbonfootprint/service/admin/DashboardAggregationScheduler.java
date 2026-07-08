package com.carbonfootprint.service.admin;

import com.carbonfootprint.dto.admin.EmissionTrendResponse;
import com.carbonfootprint.dto.admin.LeaderboardResponse;
import com.carbonfootprint.entity.admin.DailyEmissionSummary;
import com.carbonfootprint.entity.admin.DashboardMetricsSummary;
import com.carbonfootprint.entity.admin.UserEmissionSummary;
import com.carbonfootprint.repository.admin.AdminDashboardRepository;
import com.carbonfootprint.repository.admin.DailyEmissionSummaryRepository;
import com.carbonfootprint.repository.admin.DashboardMetricsSummaryRepository;
import com.carbonfootprint.repository.admin.UserEmissionSummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Configuration
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class DashboardAggregationScheduler {

    private final AdminDashboardRepository adminDashboardRepository;
    private final DashboardMetricsSummaryRepository metricsRepository;
    private final UserEmissionSummaryRepository userEmissionRepository;
    private final DailyEmissionSummaryRepository dailyEmissionRepository;
    private final CacheManager cacheManager;

    @Scheduled(cron = "0 0/5 * * * ?") // Run every 5 minutes
    @Transactional
    public void aggregateDashboardMetrics() {
        log.info("Starting scheduled dashboard metrics aggregation");

        // 1. Aggregate Global Metrics
        long activeUsers = adminDashboardRepository.countActiveUsers();
        long newRegistrations = adminDashboardRepository.countNewRegistrations(LocalDateTime.now().minusDays(30));
        BigDecimal totalEmissions = adminDashboardRepository.sumTotalEmissions();
        long totalActivities = adminDashboardRepository.countTotalActivities();
        long totalUsers = adminDashboardRepository.count();

        DashboardMetricsSummary metrics = DashboardMetricsSummary.builder()
                .id(1L)
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .newRegistrations(newRegistrations)
                .totalEmissions(totalEmissions)
                .totalActivities(totalActivities)
                .build();
        metricsRepository.save(metrics);

        // 2. Aggregate Leaderboard (Top 100 to be safe for cache)
        List<LeaderboardResponse> topEmitters = adminDashboardRepository.getTopEmitters(PageRequest.of(0, 100));
        
        userEmissionRepository.deleteAllInBatch(); // Clear old board
        
        List<UserEmissionSummary> userSummaries = topEmitters.stream()
                .map(dto -> UserEmissionSummary.builder()
                        .userId(dto.userId())
                        .username(dto.username())
                        .totalEmission(dto.totalEmissions())
                        .build())
                .collect(Collectors.toList());
        userEmissionRepository.saveAll(userSummaries);

        // 3. Aggregate Daily Trends (Last 90 days for full cache prep)
        List<EmissionTrendResponse> trends = adminDashboardRepository.getEmissionTrends(LocalDate.now().minusDays(90));
        
        List<DailyEmissionSummary> dailySummaries = trends.stream()
                .map(dto -> DailyEmissionSummary.builder()
                        .logDate(dto.date())
                        .totalEmission(dto.dailyEmission())
                        .build())
                .collect(Collectors.toList());
        dailyEmissionRepository.saveAll(dailySummaries);

        // 4. Evict Caches to ensure sub-500ms API calls get the fresh summary data
        evictCaches();

        log.info("Completed scheduled dashboard metrics aggregation");
    }

    private void evictCaches() {
        if (cacheManager.getCache("dashboardMetrics") != null) {
            cacheManager.getCache("dashboardMetrics").clear();
        }
        if (cacheManager.getCache("emissionTrends") != null) {
            cacheManager.getCache("emissionTrends").clear();
        }
        if (cacheManager.getCache("leaderboard") != null) {
            cacheManager.getCache("leaderboard").clear();
        }
    }
}
