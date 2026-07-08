package com.carbonfootprint.service.admin;

import com.carbonfootprint.dto.admin.DashboardMetricsResponse;
import com.carbonfootprint.dto.admin.EmissionTrendResponse;
import com.carbonfootprint.dto.admin.LeaderboardResponse;
import com.carbonfootprint.entity.admin.AdminSecurityEvent;
import com.carbonfootprint.entity.admin.DashboardMetricsSummary;
import com.carbonfootprint.repository.admin.AdminSecurityEventRepository;
import com.carbonfootprint.repository.admin.DailyEmissionSummaryRepository;
import com.carbonfootprint.repository.admin.DashboardMetricsSummaryRepository;
import com.carbonfootprint.repository.admin.UserEmissionSummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final com.carbonfootprint.repository.UserRepository userRepository;
    private final com.carbonfootprint.repository.ActivityLogRepository activityLogRepository;
    private final DashboardMetricsSummaryRepository metricsRepository;
    private final UserEmissionSummaryRepository userEmissionRepository;
    private final DailyEmissionSummaryRepository dailyEmissionRepository;
    private final AdminSecurityEventRepository adminSecurityEventRepository;

    @Cacheable(value = "dashboardMetrics", key = "'all'")
    public DashboardMetricsResponse getMetrics() {
        log.info("Fetching Admin Dashboard Metrics dynamically");
        
        long totalUsers = userRepository.count();
        long activeUsers = totalUsers; // Simulating active users
        long newRegistrations = userRepository.countByCreatedAtAfter(LocalDate.now().atStartOfDay());
        
        BigDecimal totalEmissions = activityLogRepository.sumAllEmissions();
        if (totalEmissions == null) totalEmissions = BigDecimal.ZERO;
        
        long totalActivities = activityLogRepository.count();
        long suspendedUsers = 0L; // Simplified
        long adminCount = userRepository.countByRole(com.carbonfootprint.entity.Role.ADMIN) + userRepository.countByRole(com.carbonfootprint.entity.Role.SUPER_ADMIN);
        long securityAlerts = adminSecurityEventRepository.count();

        return new DashboardMetricsResponse(
                totalUsers,
                activeUsers,
                newRegistrations,
                totalEmissions,
                totalActivities,
                suspendedUsers,
                securityAlerts,
                adminCount
        );
    }

    @Cacheable(value = "emissionTrends", key = "#days")
    public List<EmissionTrendResponse> getEmissionTrends(int days) {
        log.info("Fetching Emission Trends from Summary Cache for last {} days", days);
        LocalDate startDate = LocalDate.now().minusDays(days);
        
        return dailyEmissionRepository.findByLogDateGreaterThanEqualOrderByLogDateAsc(startDate)
                .stream()
                .map(summary -> new EmissionTrendResponse(summary.getLogDate(), summary.getTotalEmission()))
                .collect(Collectors.toList());
    }

    @Cacheable(value = "leaderboard", key = "'top10'")
    public List<LeaderboardResponse> getTopEmitters() {
        log.info("Fetching Top 10 Emitters Leaderboard from Summary Cache");
        
        return userEmissionRepository.findAllByOrderByTotalEmissionDesc(PageRequest.of(0, 10))
                .stream()
                .map(summary -> new LeaderboardResponse(summary.getUserId(), summary.getUsername(), summary.getTotalEmission()))
                .collect(Collectors.toList());
    }

    @Cacheable(value = "securityAlerts", key = "'recent'")
    public List<AdminSecurityEvent> getRecentSecurityAlerts() {
        log.info("Fetching Recent Security Alerts");
        return adminSecurityEventRepository.findTop10ByOrderByCreatedAtDesc();
    }
}
