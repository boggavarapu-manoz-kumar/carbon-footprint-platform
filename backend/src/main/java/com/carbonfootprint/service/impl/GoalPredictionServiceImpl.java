package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.GoalPredictionDTO;
import com.carbonfootprint.entity.Goal;
import com.carbonfootprint.entity.GoalStatus;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.GoalRepository;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.entity.ActivityLog;
import com.carbonfootprint.service.GoalPredictionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoalPredictionServiceImpl implements GoalPredictionService {

    private final GoalRepository goalRepository;
    private final ActivityLogRepository activityLogRepository;

    @Override
    public GoalPredictionDTO getGoalPrediction(Long goalId, Long userId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", goalId));
        
        if (!goal.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Goal not found or access denied");
        }

        LocalDate today = LocalDate.now();
        
        
        // Calculate current progress strictly within window
        List<ActivityLog> logsInWindow = activityLogRepository.findByUserIdAndDateBetween(userId, goal.getStartDate(), goal.getTargetDate());
        BigDecimal currentProgress = logsInWindow.stream()
                .map(ActivityLog::getEmissionValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        // Handle completed or failed goals immediately
        BigDecimal target = goal.getTargetEmission() != null ? goal.getTargetEmission() : BigDecimal.ZERO;
        BigDecimal remainingCarbon = target.subtract(currentProgress).max(BigDecimal.ZERO);
        
        if (goal.getStatus() == GoalStatus.ACHIEVED) {
            return buildPrediction("ACHIEVED", goal.getTargetDate(), currentProgress, target, remainingCarbon, 0L, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, currentProgress);
        } else if (goal.getStatus() == GoalStatus.FAILED) {
            return buildPrediction("FAILED", null, currentProgress, target, BigDecimal.ZERO, 0L, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, currentProgress);
        }
        
        // Base variables
        long totalDays = ChronoUnit.DAYS.between(goal.getStartDate(), goal.getTargetDate());
        if (totalDays <= 0) totalDays = 1;
        
        long daysElapsed = ChronoUnit.DAYS.between(goal.getStartDate(), today);
        if (daysElapsed < 0) daysElapsed = 0; // Hasn't started yet
        
        long daysRemaining = totalDays - daysElapsed;
        if (daysRemaining < 0) daysRemaining = 0;
        
        if (target.compareTo(BigDecimal.ZERO) <= 0) {
            // Unpredictable if no proper target
            return buildPrediction("UNKNOWN", null, currentProgress, BigDecimal.ZERO, BigDecimal.ZERO, daysRemaining, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, currentProgress);
        }

        if (currentProgress.compareTo(BigDecimal.ZERO) == 0 && daysElapsed <= 1 && logsInWindow.isEmpty()) {
            // No data yet, cannot predict
            return buildPrediction("UNKNOWN", null, BigDecimal.ZERO, target, target, daysRemaining, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        // Calculate Velocity (Daily Average) heavily weighting recent 7 days if available
        BigDecimal dailyAverage = BigDecimal.ZERO;
        BigDecimal averageWeeklyEmission = BigDecimal.ZERO;
        
        if (daysElapsed > 0) {
            LocalDate sevenDaysAgo = today.minusDays(7);
            if (sevenDaysAgo.isBefore(goal.getStartDate())) sevenDaysAgo = goal.getStartDate();
            
            final LocalDate weekStart = sevenDaysAgo;
            long recentDays = ChronoUnit.DAYS.between(weekStart, today);
            if (recentDays <= 0) recentDays = 1;
            
            BigDecimal recentProgress = logsInWindow.stream()
                    .filter(log -> !log.getLogDate().isBefore(weekStart) && !log.getLogDate().isAfter(today))
                    .map(ActivityLog::getEmissionValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            if (recentDays >= 3 && recentProgress.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal recentVelocity = recentProgress.divide(BigDecimal.valueOf(recentDays), 4, RoundingMode.HALF_UP);
                BigDecimal allTimeVelocity = currentProgress.divide(BigDecimal.valueOf(daysElapsed), 4, RoundingMode.HALF_UP);
                dailyAverage = recentVelocity.multiply(BigDecimal.valueOf(0.7)).add(allTimeVelocity.multiply(BigDecimal.valueOf(0.3)));
                averageWeeklyEmission = recentVelocity.multiply(BigDecimal.valueOf(7));
            } else {
                dailyAverage = currentProgress.divide(BigDecimal.valueOf(daysElapsed), 4, RoundingMode.HALF_UP);
                averageWeeklyEmission = dailyAverage.multiply(BigDecimal.valueOf(7));
            }
        }

        // Projected Carbon at end of goal period
        BigDecimal projectedCarbon = currentProgress.add(dailyAverage.multiply(BigDecimal.valueOf(daysRemaining)));

        // Expected Completion Date (when will they hit the target at current velocity?)
        LocalDate expectedCompletionDate = null;
        if (dailyAverage.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal remainingToTarget = target.subtract(currentProgress);
            if (remainingToTarget.compareTo(BigDecimal.ZERO) > 0) {
                long daysToHitTarget = remainingToTarget.divide(dailyAverage, 0, RoundingMode.HALF_UP).longValue();
                expectedCompletionDate = today.plusDays(daysToHitTarget);
            } else {
                expectedCompletionDate = today;
            }
        }

        // Determine Status
        String predictionStatus;
        if (currentProgress.compareTo(target) > 0) {
            predictionStatus = "FAILED";
        } else if (projectedCarbon.compareTo(target) <= 0) {
            BigDecimal margin = target.subtract(projectedCarbon);
            if (margin.compareTo(target.multiply(BigDecimal.valueOf(0.1))) > 0) {
                predictionStatus = "AHEAD_OF_SCHEDULE";
            } else {
                predictionStatus = "ON_TRACK";
            }
        } else if (projectedCarbon.compareTo(target.multiply(BigDecimal.valueOf(1.15))) <= 0) {
            predictionStatus = "SLIGHTLY_BEHIND";
        } else {
            predictionStatus = "BEHIND_SCHEDULE";
        }

        // Current Reduction Rate (Baseline vs Current pace)
        BigDecimal currentReductionRate = BigDecimal.ZERO;
        if (goal.getBaselineEmission() != null && goal.getBaselineEmission().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal expectedWeeklyBaseline = goal.getBaselineEmission().divide(BigDecimal.valueOf(30), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(7));
            if (expectedWeeklyBaseline.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal diff = expectedWeeklyBaseline.subtract(averageWeeklyEmission);
                currentReductionRate = diff.divide(expectedWeeklyBaseline, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
            }
        }

        return buildPrediction(predictionStatus, expectedCompletionDate, currentProgress, target, remainingCarbon, daysRemaining, dailyAverage, averageWeeklyEmission, currentReductionRate, projectedCarbon);
    }

    private GoalPredictionDTO buildPrediction(String status, LocalDate expectedDate, BigDecimal currentCarbon, BigDecimal targetCarbon, BigDecimal remainingCarbon, Long daysRemaining, BigDecimal avgDaily, BigDecimal avgWeekly, BigDecimal currentReductionRate, BigDecimal projectedCarbon) {
        return GoalPredictionDTO.builder()
                .predictionStatus(status)
                .projectedCompletionDate(expectedDate)
                .currentCarbon(currentCarbon.setScale(2, RoundingMode.HALF_UP))
                .targetCarbon(targetCarbon.setScale(2, RoundingMode.HALF_UP))
                .remainingCarbon(remainingCarbon.setScale(2, RoundingMode.HALF_UP))
                .daysRemaining(daysRemaining)
                .averageDailyEmission(avgDaily.setScale(2, RoundingMode.HALF_UP))
                .averageWeeklyEmission(avgWeekly.setScale(2, RoundingMode.HALF_UP))
                .currentReductionRate(currentReductionRate.setScale(2, RoundingMode.HALF_UP))
                .projectedFinalCarbon(projectedCarbon.setScale(2, RoundingMode.HALF_UP))
                .build();
    }
}
