package com.carbonfootprint.service.admin;

import com.carbonfootprint.dto.admin.ActivityTrendResponse;
import com.carbonfootprint.dto.admin.CategoryAnalyticsResponse;
import com.carbonfootprint.dto.admin.UserGrowthResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminAnalyticsService {

    private final com.carbonfootprint.repository.UserRepository userRepository;
    private final com.carbonfootprint.repository.ActivityLogRepository activityLogRepository;

    @Cacheable(value = "userGrowth", key = "#days")
    public List<UserGrowthResponse> getUserGrowth(int days) {
        log.info("Fetching User Growth for last {} days", days);
        LocalDate startLocalDate = LocalDate.now().minusDays(days);
        java.time.LocalDateTime startDate = startLocalDate.atStartOfDay();

        List<Object[]> queryResults = userRepository.countUsersGroupedByDate(startDate);
        
        // Calculate the base total users before the start date
        long totalUsersBefore = userRepository.count() - userRepository.countByCreatedAtAfter(startDate);

        List<UserGrowthResponse> growth = new ArrayList<>();
        long runningTotal = totalUsersBefore;
        
        // Populate a map for O(1) lookup
        java.util.Map<LocalDate, Long> dateRegMap = new java.util.HashMap<>();
        for (Object[] result : queryResults) {
            java.sql.Date sqlDate = (java.sql.Date) result[0];
            LocalDate date = sqlDate.toLocalDate();
            long count = ((Number) result[1]).longValue();
            dateRegMap.put(date, count);
        }

        for (int i = days; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            long newRegs = dateRegMap.getOrDefault(date, 0L);
            runningTotal += newRegs;
            growth.add(new UserGrowthResponse(date, newRegs, runningTotal));
        }
        return growth;
    }

    @Cacheable(value = "activityTrends", key = "#days")
    public List<ActivityTrendResponse> getActivityTrends(int days) {
        log.info("Fetching Activity Trends for last {} days", days);
        LocalDate startDate = LocalDate.now().minusDays(days);
        
        List<Object[]> queryResults = activityLogRepository.countActivitiesGroupedByDate(startDate);
        
        List<ActivityTrendResponse> trends = new ArrayList<>();
        
        java.util.Map<LocalDate, Long> dateActMap = new java.util.HashMap<>();
        for (Object[] result : queryResults) {
            java.sql.Date sqlDate = (java.sql.Date) result[0];
            LocalDate date = sqlDate.toLocalDate();
            long count = ((Number) result[1]).longValue();
            dateActMap.put(date, count);
        }

        for (int i = days; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            long activityCount = dateActMap.getOrDefault(date, 0L);
            trends.add(new ActivityTrendResponse(date, activityCount));
        }
        return trends;
    }

    @Cacheable(value = "categoryAnalytics", key = "'all'")
    public List<CategoryAnalyticsResponse> getCategoryAnalytics() {
        log.info("Fetching Category Analytics");
        List<Object[]> queryResults = activityLogRepository.sumEmissionsAndCountByCategory();
        List<CategoryAnalyticsResponse> response = new ArrayList<>();
        
        for (Object[] result : queryResults) {
            String category = (String) result[0];
            BigDecimal totalEmissions = (BigDecimal) result[1];
            long count = ((Number) result[2]).longValue();
            response.add(new CategoryAnalyticsResponse(category, totalEmissions, (int) count));
        }
        return response;
    }
}
