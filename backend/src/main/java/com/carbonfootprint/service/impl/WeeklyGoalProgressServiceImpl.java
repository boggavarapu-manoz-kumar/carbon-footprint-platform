package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.WeeklyGoalProgressDTO;
import com.carbonfootprint.entity.Goal;
import com.carbonfootprint.entity.GoalStatus;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.GoalRepository;
import com.carbonfootprint.service.WeeklyGoalProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeeklyGoalProgressServiceImpl implements WeeklyGoalProgressService {

    private final ActivityLogRepository activityLogRepository;
    private final GoalRepository goalRepository;

    @Override
    @Cacheable(value = "weeklyGoalProgress", key = "#userId")
    public WeeklyGoalProgressDTO getWeeklyProgress(Long userId) {
        log.info("Calculating weekly progress for user {}", userId);

        LocalDate today = LocalDate.now();
        LocalDate startOfCurrentWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfCurrentWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        
        LocalDate startOfPreviousWeek = startOfCurrentWeek.minusWeeks(1);
        LocalDate endOfPreviousWeek = endOfCurrentWeek.minusWeeks(1);

        BigDecimal currentWeekCarbon = activityLogRepository.sumEmissionsByUserIdAndDateRange(userId, startOfCurrentWeek, endOfCurrentWeek);
        if (currentWeekCarbon == null) currentWeekCarbon = BigDecimal.ZERO;

        BigDecimal previousWeekCarbon = activityLogRepository.sumEmissionsByUserIdAndDateRange(userId, startOfPreviousWeek, endOfPreviousWeek);
        if (previousWeekCarbon == null) previousWeekCarbon = BigDecimal.ZERO;

        // Fetch active goals to figure out a "weekly target"
        List<Goal> activeGoals = goalRepository.findByStatus(GoalStatus.IN_PROGRESS)
                .stream().filter(g -> g.getUser().getId().equals(userId))
                .toList();
        
        BigDecimal goalTarget = BigDecimal.valueOf(500); // Default placeholder
        if (!activeGoals.isEmpty()) {
            Goal goal = activeGoals.get(0);
            if (goal.getTargetEmission() != null && goal.getTargetEmission().compareTo(BigDecimal.ZERO) > 0) {
                // If it's a 30-day goal, scale to 7 days
                long days = java.time.temporal.ChronoUnit.DAYS.between(goal.getStartDate(), goal.getTargetDate());
                if (days > 0) {
                    BigDecimal dailyTarget = goal.getTargetEmission().divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP);
                    goalTarget = dailyTarget.multiply(BigDecimal.valueOf(7));
                } else {
                    goalTarget = goal.getTargetEmission();
                }
            }
        }

        BigDecimal weeklyReduction = previousWeekCarbon.subtract(currentWeekCarbon);
        BigDecimal remainingReduction = BigDecimal.ZERO;
        if (weeklyReduction.compareTo(BigDecimal.ZERO) < 0) {
            remainingReduction = weeklyReduction.abs();
            weeklyReduction = BigDecimal.ZERO;
        }

        BigDecimal progressPercent = BigDecimal.ZERO;
        if (goalTarget.compareTo(BigDecimal.ZERO) > 0) {
            progressPercent = currentWeekCarbon.divide(goalTarget, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
        }

        BigDecimal weeklyImprovementPercent = BigDecimal.ZERO;
        if (previousWeekCarbon.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = previousWeekCarbon.subtract(currentWeekCarbon);
            weeklyImprovementPercent = diff.divide(previousWeekCarbon, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
        }

        BigDecimal remainingCarbon = goalTarget.subtract(currentWeekCarbon);
        if (remainingCarbon.compareTo(BigDecimal.ZERO) < 0) {
            remainingCarbon = BigDecimal.ZERO;
        }

        return WeeklyGoalProgressDTO.builder()
                .currentWeekCarbon(currentWeekCarbon.setScale(2, RoundingMode.HALF_UP))
                .previousWeekCarbon(previousWeekCarbon.setScale(2, RoundingMode.HALF_UP))
                .goalTarget(goalTarget.setScale(2, RoundingMode.HALF_UP))
                .weeklyReduction(weeklyReduction.setScale(2, RoundingMode.HALF_UP))
                .remainingReduction(remainingReduction.setScale(2, RoundingMode.HALF_UP))
                .progressPercent(progressPercent.setScale(2, RoundingMode.HALF_UP))
                .weeklyImprovementPercent(weeklyImprovementPercent.setScale(2, RoundingMode.HALF_UP))
                .carbonSaved(weeklyReduction.setScale(2, RoundingMode.HALF_UP))
                .remainingCarbon(remainingCarbon.setScale(2, RoundingMode.HALF_UP))
                .build();
    }
}
