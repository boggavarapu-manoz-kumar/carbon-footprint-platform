package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.activity.StatisticsDto;
import com.carbonfootprint.entity.ActivityCategory;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.OtherActivityLogRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.entity.OtherActivityLog;
import com.carbonfootprint.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

    private final ActivityLogRepository activityLogRepository;
    private final OtherActivityLogRepository otherActivityLogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public StatisticsDto getDashboardStatistics(String username) {
        log.info("Calculating dashboard statistics for user: {}", username);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", username));

        Long userId = user.getId();

        // OPTIMIZATION: Instead of 6 separate aggregate queries, we fetch the data once.
        // For a Google-standard dashboard, minimizing DB round-trips is critical for low latency.
        List<com.carbonfootprint.entity.ActivityLog> logs = activityLogRepository.findAll((root, query, cb) -> cb.equal(root.get("user").get("id"), userId));
        List<OtherActivityLog> otherLogs = otherActivityLogRepository.findByUserId(userId);

        LocalDate now = LocalDate.now();
        LocalDate startOfCurrentMonth = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfCurrentMonth = now.with(TemporalAdjusters.lastDayOfMonth());
        
        LocalDate startOfPrevMonth = now.minusMonths(1).with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfPrevMonth = now.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth());
        
        LocalDate startOfLast7Days = now.minusDays(7);

        BigDecimal totalEmissions = BigDecimal.ZERO;
        BigDecimal currentMonthEmissions = BigDecimal.ZERO;
        BigDecimal previousMonthEmissions = BigDecimal.ZERO;
        BigDecimal weeklyEmissions = BigDecimal.ZERO;
        Map<String, BigDecimal> emissionsByCategory = new HashMap<>();

        for (com.carbonfootprint.entity.ActivityLog logItem : logs) {
            BigDecimal val = logItem.getEmissionValue() != null ? logItem.getEmissionValue() : BigDecimal.ZERO;
            LocalDate logDate = logItem.getLogDate();
            
            // Total
            totalEmissions = totalEmissions.add(val);
            
            // Current Month
            if (logDate != null && !logDate.isBefore(startOfCurrentMonth) && !logDate.isAfter(endOfCurrentMonth)) {
                currentMonthEmissions = currentMonthEmissions.add(val);
            }
            
            // Previous Month
            if (logDate != null && !logDate.isBefore(startOfPrevMonth) && !logDate.isAfter(endOfPrevMonth)) {
                previousMonthEmissions = previousMonthEmissions.add(val);
            }
            
            // Weekly
            if (logDate != null && !logDate.isBefore(startOfLast7Days) && !logDate.isAfter(now)) {
                weeklyEmissions = weeklyEmissions.add(val);
            }
            
            // Category
            String category = "OTHER";
            if (logItem.getActivityType() != null && 
                logItem.getActivityType().getSubCategory() != null && 
                logItem.getActivityType().getSubCategory().getCategory() != null) {
                category = logItem.getActivityType().getSubCategory().getCategory().getCode();
            }
            emissionsByCategory.put(category, emissionsByCategory.getOrDefault(category, BigDecimal.ZERO).add(val));
        }

        for (OtherActivityLog logItem : otherLogs) {
            BigDecimal val = logItem.getCarbonValue() != null ? logItem.getCarbonValue() : BigDecimal.ZERO;
            LocalDate logDate = logItem.getLogDate();
            
            totalEmissions = totalEmissions.add(val);
            
            if (logDate != null && !logDate.isBefore(startOfCurrentMonth) && !logDate.isAfter(endOfCurrentMonth)) {
                currentMonthEmissions = currentMonthEmissions.add(val);
            }
            if (logDate != null && !logDate.isBefore(startOfPrevMonth) && !logDate.isAfter(endOfPrevMonth)) {
                previousMonthEmissions = previousMonthEmissions.add(val);
            }
            if (logDate != null && !logDate.isBefore(startOfLast7Days) && !logDate.isAfter(now)) {
                weeklyEmissions = weeklyEmissions.add(val);
            }
            
            emissionsByCategory.put("Other", emissionsByCategory.getOrDefault("Other", BigDecimal.ZERO).add(val));
        }

        Long totalActivities = (long) (logs.size() + otherLogs.size());

        // Sustainability Score Logic
        int score = 85;
        if (currentMonthEmissions.compareTo(BigDecimal.valueOf(500)) > 0) {
            score = 65;
        } else if (currentMonthEmissions.compareTo(BigDecimal.valueOf(200)) < 0 && currentMonthEmissions.compareTo(BigDecimal.ZERO) > 0) {
            score = 95;
        }

        return StatisticsDto.builder()
                .totalEmissions(totalEmissions)
                .totalActivities(totalActivities)
                .currentMonthEmissions(currentMonthEmissions)
                .previousMonthEmissions(previousMonthEmissions)
                .weeklyEmissions(weeklyEmissions)
                .sustainabilityScore(score)
                .emissionsByCategory(emissionsByCategory)
                .build();
    }
}
