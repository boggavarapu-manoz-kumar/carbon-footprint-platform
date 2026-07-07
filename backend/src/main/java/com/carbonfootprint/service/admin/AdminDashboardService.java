package com.carbonfootprint.service.admin;

import com.carbonfootprint.dto.admin.DashboardMetricsResponse;
import com.carbonfootprint.dto.admin.EmissionTrendResponse;
import com.carbonfootprint.dto.admin.LeaderboardResponse;
import com.carbonfootprint.entity.admin.AdminSecurityEvent;
import com.carbonfootprint.repository.admin.AdminDashboardRepository;
import com.carbonfootprint.repository.admin.AdminSecurityEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final AdminDashboardRepository adminDashboardRepository;
    private final AdminSecurityEventRepository adminSecurityEventRepository;

    @Cacheable(value = "dashboardMetrics", key = "'all'")
    public DashboardMetricsResponse getMetrics() {
        log.info("Fetching Admin Dashboard Metrics from Database");
        return new DashboardMetricsResponse(
                adminDashboardRepository.count(),
                adminDashboardRepository.countActiveUsers(),
                adminDashboardRepository.countNewRegistrations(LocalDateTime.now().minusDays(30)),
                adminDashboardRepository.sumTotalEmissions(),
                adminDashboardRepository.countTotalActivities()
        );
    }

    @Cacheable(value = "emissionTrends", key = "#days")
    public List<EmissionTrendResponse> getEmissionTrends(int days) {
        log.info("Fetching Emission Trends for last {} days", days);
        LocalDate startDate = LocalDate.now().minusDays(days);
        return adminDashboardRepository.getEmissionTrends(startDate);
    }

    @Cacheable(value = "leaderboard", key = "'top10'")
    public List<LeaderboardResponse> getTopEmitters() {
        log.info("Fetching Top 10 Emitters Leaderboard");
        return adminDashboardRepository.getTopEmitters(PageRequest.of(0, 10));
    }

    @Cacheable(value = "securityAlerts", key = "'recent'")
    public List<AdminSecurityEvent> getRecentSecurityAlerts() {
        log.info("Fetching Recent Security Alerts");
        return adminSecurityEventRepository.findTop10ByOrderByCreatedAtDesc();
    }
}
