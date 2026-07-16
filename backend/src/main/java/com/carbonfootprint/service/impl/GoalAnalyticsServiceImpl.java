package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.GoalAnalyticsDTO;
import com.carbonfootprint.entity.ActivityLog;
import com.carbonfootprint.entity.ActivityType;
import com.carbonfootprint.entity.Goal;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.GoalRepository;
import com.carbonfootprint.service.GoalAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoalAnalyticsServiceImpl implements GoalAnalyticsService {

    private final GoalRepository goalRepository;
    private final ActivityLogRepository activityLogRepository;

    @Override
    @Transactional(readOnly = true)
    public GoalAnalyticsDTO getGoalAnalytics(Long goalId, Long userId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Goal not found or access denied");
        }

        LocalDate startDate = goal.getStartDate();
        LocalDate targetDate = goal.getTargetDate();
        LocalDate today = LocalDate.now();
        
        long totalDays = Math.max(1, ChronoUnit.DAYS.between(startDate, targetDate));
        long daysRemaining = Math.max(0, ChronoUnit.DAYS.between(today, targetDate));
        
        BigDecimal targetEmission = goal.getTargetEmission() != null ? goal.getTargetEmission() : BigDecimal.ZERO;
        
        List<ActivityLog> logsInWindow = activityLogRepository.findByUserIdAndDateBetween(userId, startDate, targetDate);
        
        // Calculate current progress strictly within window
        BigDecimal currentProgress = logsInWindow.stream()
                .map(ActivityLog::getEmissionValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal progressPercent = BigDecimal.ZERO;
        if (targetEmission.compareTo(BigDecimal.ZERO) > 0) {
            progressPercent = currentProgress.divide(targetEmission, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
        }

        // Calculate Weekly Progress (last 7 days within window)
        LocalDate oneWeekAgo = today.minusDays(7);
        if (oneWeekAgo.isBefore(startDate)) oneWeekAgo = startDate;
        
        LocalDate finalOneWeekAgo = oneWeekAgo;
        BigDecimal weeklyProgress = logsInWindow.stream()
                .filter(log -> !log.getLogDate().isBefore(finalOneWeekAgo) && !log.getLogDate().isAfter(today))
                .map(ActivityLog::getEmissionValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Timeline Data
        List<GoalAnalyticsDTO.TimelineDataPoint> timeline = buildTimeline(startDate, targetDate, today, logsInWindow, targetEmission, totalDays);
        
        // Category Shares
        List<GoalAnalyticsDTO.CategoryShare> categoryShares = buildCategoryShares(logsInWindow, currentProgress);

        return GoalAnalyticsDTO.builder()
                .goalId(goal.getId())
                .currentProgress(currentProgress.setScale(2, RoundingMode.HALF_UP))
                .targetEmission(targetEmission.setScale(2, RoundingMode.HALF_UP))
                .progressPercent(progressPercent.setScale(1, RoundingMode.HALF_UP))
                .remainingDays(daysRemaining)
                .totalDays(totalDays)
                .weeklyProgress(weeklyProgress.setScale(2, RoundingMode.HALF_UP))
                .timeline(timeline)
                .categoryShares(categoryShares)
                .build();
    }

    private List<GoalAnalyticsDTO.TimelineDataPoint> buildTimeline(
            LocalDate start, LocalDate target, LocalDate today, 
            List<ActivityLog> logs, BigDecimal targetEmission, long totalDays) {
            
        List<GoalAnalyticsDTO.TimelineDataPoint> timeline = new ArrayList<>();
        
        // Group logs by date
        Map<LocalDate, BigDecimal> dailyEmissions = new HashMap<>();
        for (ActivityLog log : logs) {
            dailyEmissions.merge(log.getLogDate(), log.getEmissionValue(), BigDecimal::add);
        }
        
        BigDecimal cumulativeEmissions = BigDecimal.ZERO;
        BigDecimal idealDailyBurn = targetEmission.divide(BigDecimal.valueOf(totalDays), 4, RoundingMode.HALF_UP);
        BigDecimal cumulativeIdeal = BigDecimal.ZERO;
        
        // Iterate from start to target
        LocalDate current = start;
        while (!current.isAfter(target)) {
            if (!current.isAfter(today)) {
                cumulativeEmissions = cumulativeEmissions.add(dailyEmissions.getOrDefault(current, BigDecimal.ZERO));
            }
            
            cumulativeIdeal = cumulativeIdeal.add(idealDailyBurn);
            
            timeline.add(GoalAnalyticsDTO.TimelineDataPoint.builder()
                    .date(current.toString())
                    .cumulativeEmissions(current.isAfter(today) ? null : cumulativeEmissions.setScale(2, RoundingMode.HALF_UP))
                    .idealBurn(cumulativeIdeal.setScale(2, RoundingMode.HALF_UP))
                    .build());
            
            current = current.plusDays(1);
        }
        
        return timeline;
    }

    private List<GoalAnalyticsDTO.CategoryShare> buildCategoryShares(List<ActivityLog> logs, BigDecimal totalProgress) {
        Map<ActivityType, BigDecimal> categoryTotals = new HashMap<>();
        for (ActivityLog log : logs) {
            categoryTotals.merge(log.getActivityType(), log.getEmissionValue(), BigDecimal::add);
        }
        
        return categoryTotals.entrySet().stream()
                .map(entry -> {
                    BigDecimal percentage = BigDecimal.ZERO;
                    if (totalProgress.compareTo(BigDecimal.ZERO) > 0) {
                        percentage = entry.getValue().divide(totalProgress, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
                    }
                    return GoalAnalyticsDTO.CategoryShare.builder()
                            .category(entry.getKey().getName())
                            .emissions(entry.getValue().setScale(2, RoundingMode.HALF_UP))
                            .percentage(percentage.setScale(1, RoundingMode.HALF_UP))
                            .build();
                })
                .sorted((GoalAnalyticsDTO.CategoryShare a, GoalAnalyticsDTO.CategoryShare b) -> b.getEmissions().compareTo(a.getEmissions()))
                .collect(Collectors.toList());
    }
}
