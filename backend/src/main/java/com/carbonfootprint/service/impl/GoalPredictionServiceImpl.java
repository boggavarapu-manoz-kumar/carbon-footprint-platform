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
        if (goal.getStatus() == GoalStatus.ACHIEVED) {
            return buildPrediction("ACHIEVED", goal.getTargetDate(), currentProgress, BigDecimal.valueOf(100), BigDecimal.valueOf(100));
        } else if (goal.getStatus() == GoalStatus.FAILED) {
            return buildPrediction("FAILED", null, currentProgress, BigDecimal.ZERO, BigDecimal.valueOf(100));
        }
        
        // Base variables
        long totalDays = ChronoUnit.DAYS.between(goal.getStartDate(), goal.getTargetDate());
        if (totalDays <= 0) totalDays = 1;
        
        long daysElapsed = ChronoUnit.DAYS.between(goal.getStartDate(), today);
        if (daysElapsed < 0) daysElapsed = 0; // Hasn't started yet
        
        long daysRemaining = totalDays - daysElapsed;
        if (daysRemaining < 0) daysRemaining = 0;

        BigDecimal target = goal.getTargetEmission();
        
        if (target == null || target.compareTo(BigDecimal.ZERO) <= 0) {
            // Unpredictable if no proper target
            return buildPrediction("UNKNOWN", null, currentProgress, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        if (currentProgress.compareTo(BigDecimal.ZERO) == 0 && daysElapsed <= 1 && logsInWindow.isEmpty()) {
            // No data yet, cannot predict
            return buildPrediction("UNKNOWN", null, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        // Calculate Velocity (Daily Average)
        BigDecimal dailyAverage = BigDecimal.ZERO;
        if (daysElapsed > 0) {
            dailyAverage = currentProgress.divide(BigDecimal.valueOf(daysElapsed), 4, RoundingMode.HALF_UP);
        }

        // Projected Carbon at end of goal period
        BigDecimal projectedCarbon = currentProgress.add(dailyAverage.multiply(BigDecimal.valueOf(daysRemaining)));

        // Expected Completion Date (when will they hit the target at current velocity?)
        LocalDate expectedCompletionDate = null;
        if (dailyAverage.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal remainingCarbon = target.subtract(currentProgress);
            if (remainingCarbon.compareTo(BigDecimal.ZERO) > 0) {
                long daysToHitTarget = remainingCarbon.divide(dailyAverage, 0, RoundingMode.HALF_UP).longValue();
                expectedCompletionDate = today.plusDays(daysToHitTarget);
            } else {
                expectedCompletionDate = today;
            }
        }

        // Determine Status
        String predictionStatus;
        if (projectedCarbon.compareTo(target) <= 0) {
            predictionStatus = "ON_TRACK";
        } else if (projectedCarbon.compareTo(target.multiply(BigDecimal.valueOf(1.15))) <= 0) {
            predictionStatus = "SLIGHTLY_BEHIND";
        } else {
            predictionStatus = "BEHIND_SCHEDULE";
        }

        // Probability of Success (0 - 100%)
        BigDecimal probability = BigDecimal.ZERO;
        if (projectedCarbon.compareTo(BigDecimal.ZERO) > 0) {
            probability = target.divide(projectedCarbon, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
            if (probability.compareTo(BigDecimal.valueOf(100)) > 0) {
                probability = BigDecimal.valueOf(100);
            }
        } else if (projectedCarbon.compareTo(BigDecimal.ZERO) == 0 && target.compareTo(BigDecimal.ZERO) > 0) {
            probability = BigDecimal.valueOf(100);
        }

        // Confidence Score (How reliable is the prediction based on elapsed time?)
        // e.g. 1 day elapsed out of 30 = ~3% confidence. 20 days elapsed = ~66% confidence.
        // We cap minimum confidence at 5% and max at 95% while in progress.
        BigDecimal confidenceScore = BigDecimal.valueOf(daysElapsed).divide(BigDecimal.valueOf(totalDays), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
        if (confidenceScore.compareTo(BigDecimal.valueOf(5)) < 0) confidenceScore = BigDecimal.valueOf(5);
        if (confidenceScore.compareTo(BigDecimal.valueOf(95)) > 0 && goal.getStatus() == GoalStatus.IN_PROGRESS) confidenceScore = BigDecimal.valueOf(95);

        return buildPrediction(predictionStatus, expectedCompletionDate, projectedCarbon, probability, confidenceScore);
    }

    private GoalPredictionDTO buildPrediction(String status, LocalDate expectedDate, BigDecimal projectedCarbon, BigDecimal probability, BigDecimal confidence) {
        return GoalPredictionDTO.builder()
                .predictionStatus(status)
                .expectedCompletionDate(expectedDate)
                .projectedCarbon(projectedCarbon.setScale(2, RoundingMode.HALF_UP))
                .probabilityOfSuccess(probability.setScale(1, RoundingMode.HALF_UP))
                .confidenceScore(confidence.setScale(1, RoundingMode.HALF_UP))
                .build();
    }
}
