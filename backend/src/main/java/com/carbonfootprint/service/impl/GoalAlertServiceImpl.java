package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.GoalAlertDTO;
import com.carbonfootprint.dto.GoalPredictionDTO;
import com.carbonfootprint.dto.WeeklyGoalProgressDTO;
import com.carbonfootprint.entity.ActivityLog;
import com.carbonfootprint.entity.ActivityType;
import com.carbonfootprint.entity.Goal;
import com.carbonfootprint.entity.GoalStatus;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.GoalRepository;
import com.carbonfootprint.service.GoalAlertService;
import com.carbonfootprint.service.GoalPredictionService;
import com.carbonfootprint.service.WeeklyGoalProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoalAlertServiceImpl implements GoalAlertService {

    private final GoalRepository goalRepository;
    private final ActivityLogRepository activityLogRepository;
    private final GoalPredictionService goalPredictionService;
    private final WeeklyGoalProgressService weeklyGoalProgressService;

    @Override
    public List<GoalAlertDTO> getGoalAlerts(Long userId) {
        List<GoalAlertDTO> alerts = new ArrayList<>();
        
        List<Goal> allGoals = goalRepository.findByUserIdOrderByCreatedAtDesc(userId);
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        // 1. Weekly Progress Alert
        WeeklyGoalProgressDTO weeklyProgress = weeklyGoalProgressService.getWeeklyProgress(userId);
        if (weeklyProgress.getCurrentWeekCarbon().compareTo(BigDecimal.ZERO) > 0 || weeklyProgress.getPreviousWeekCarbon().compareTo(BigDecimal.ZERO) > 0) {
            alerts.add(buildWeeklyProgressAlert(weeklyProgress));
        }

        for (Goal goal : allGoals) {
            // 2. Goal Created & Started
            if (goal.getCreatedAt() != null && ChronoUnit.DAYS.between(goal.getCreatedAt(), now) <= 3) {
                alerts.add(GoalAlertDTO.builder()
                        .alertType("GOAL_CREATED")
                        .severity("INFO")
                        .message("Goal '" + goal.getName() + "' was successfully created. Let's start tracking!")
                        .relatedGoalId(goal.getId())
                        .build());
            } else if (goal.getStartDate() != null && ChronoUnit.DAYS.between(goal.getStartDate(), today) >= 0 && ChronoUnit.DAYS.between(goal.getStartDate(), today) <= 3) {
                alerts.add(GoalAlertDTO.builder()
                        .alertType("GOAL_STARTED")
                        .severity("INFO")
                        .message("Your goal '" + goal.getName() + "' has officially started today.")
                        .relatedGoalId(goal.getId())
                        .build());
            }

            // 3. Completed & Failed
            if (goal.getStatus() == GoalStatus.ACHIEVED && goal.getUpdatedAt() != null && ChronoUnit.DAYS.between(goal.getUpdatedAt(), now) <= 7) {
                BigDecimal reduction = goal.getProgressPercent();
                alerts.add(GoalAlertDTO.builder()
                        .alertType("GOAL_COMPLETED")
                        .severity("SUCCESS")
                        .message("Congratulations! Goal completed successfully. Carbon reduced by " + reduction.setScale(0, RoundingMode.HALF_UP) + "%.")
                        .relatedGoalId(goal.getId())
                        .build());
            } else if (goal.getStatus() == GoalStatus.FAILED && goal.getUpdatedAt() != null && ChronoUnit.DAYS.between(goal.getUpdatedAt(), now) <= 7) {
                alerts.add(GoalAlertDTO.builder()
                        .alertType("GOAL_FAILED")
                        .severity("WARNING")
                        .message("Unfortunately, you missed the target for '" + goal.getName() + "'. Let's set a new one and try again.")
                        .relatedGoalId(goal.getId())
                        .build());
            }

            // 4. In Progress Tracking (Goal Improved / Goal Behind)
            if (goal.getStatus() == GoalStatus.IN_PROGRESS) {
                GoalPredictionDTO prediction = goalPredictionService.getGoalPrediction(goal.getId(), userId);
                
                if ("AHEAD_OF_SCHEDULE".equals(prediction.getPredictionStatus()) || "ON_TRACK".equals(prediction.getPredictionStatus())) {
                    alerts.add(buildEncouragementAlert(goal, prediction));
                } else if ("BEHIND_SCHEDULE".equals(prediction.getPredictionStatus()) || "SLIGHTLY_BEHIND".equals(prediction.getPredictionStatus())) {
                    alerts.add(buildCorrectionAlert(goal, prediction, userId));
                }
            }
        }
        
        return alerts;
    }

    private GoalAlertDTO buildWeeklyProgressAlert(WeeklyGoalProgressDTO progress) {
        if (progress.getWeeklyReduction().compareTo(BigDecimal.ZERO) > 0) {
            return GoalAlertDTO.builder()
                    .alertType("WEEKLY_PROGRESS")
                    .severity("SUCCESS")
                    .message("Excellent! You reduced your emissions by " + progress.getWeeklyImprovementPercent().setScale(0, RoundingMode.HALF_UP) + "% this week.")
                    .build();
        } else {
            return GoalAlertDTO.builder()
                    .alertType("WEEKLY_PROGRESS")
                    .severity("INFO")
                    .message("Your emissions increased by " + progress.getWeeklyImprovementPercent().abs().setScale(0, RoundingMode.HALF_UP) + "% this week compared to last week.")
                    .build();
        }
    }

    private GoalAlertDTO buildEncouragementAlert(Goal goal, GoalPredictionDTO prediction) {
        String message = "Excellent! You're ahead of your goal '" + goal.getName() + "'.";
                         
        return GoalAlertDTO.builder()
                .alertType("GOAL_IMPROVED")
                .severity("SUCCESS")
                .message(message)
                .relatedGoalId(goal.getId())
                .build();
    }

    private GoalAlertDTO buildCorrectionAlert(Goal goal, GoalPredictionDTO prediction, Long userId) {
        LocalDate today = LocalDate.now();
        long daysRemaining = ChronoUnit.DAYS.between(today, goal.getTargetDate());
        
        String baseMessage = "Warning! You're falling behind your goal '" + goal.getName() + "'. ";
        
        LocalDate oneWeekAgo = today.minusDays(7);
        LocalDate twoWeeksAgo = today.minusDays(14);
        
        List<ActivityLog> thisWeekLogs = activityLogRepository.findByUserIdAndDateBetween(userId, oneWeekAgo, today);
        List<ActivityLog> lastWeekLogs = activityLogRepository.findByUserIdAndDateBetween(userId, twoWeeksAgo, oneWeekAgo.minusDays(1));
        
        Map<ActivityType, BigDecimal> thisWeekTotals = aggregateByCategory(thisWeekLogs);
        Map<ActivityType, BigDecimal> lastWeekTotals = aggregateByCategory(lastWeekLogs);
        
        ActivityType worstCategory = null;
        BigDecimal maxIncrease = BigDecimal.ZERO;
        
        for (Map.Entry<ActivityType, BigDecimal> entry : thisWeekTotals.entrySet()) {
            ActivityType type = entry.getKey();
            BigDecimal thisWeekTotal = entry.getValue();
            BigDecimal lastWeekTotal = lastWeekTotals.getOrDefault(type, BigDecimal.ZERO);
            
            BigDecimal increase = thisWeekTotal.subtract(lastWeekTotal);
            if (increase.compareTo(maxIncrease) > 0) {
                maxIncrease = increase;
                worstCategory = type;
            }
        }
        
        if (worstCategory != null) {
            String categoryName = formatCategoryName(worstCategory.getName());
            baseMessage = "Warning! Your " + categoryName + " emissions increased this week. ";
        }

        BigDecimal targetEmission = goal.getTargetEmission() != null ? goal.getTargetEmission() : BigDecimal.ZERO;
        if (daysRemaining > 0 && prediction.getProjectedFinalCarbon().compareTo(targetEmission) > 0) {
            BigDecimal surplus = prediction.getProjectedFinalCarbon().subtract(targetEmission);
            BigDecimal weeklyReductionNeeded = surplus.divide(BigDecimal.valueOf(Math.max(1, daysRemaining / 7.0)), 0, RoundingMode.HALF_UP);
            
            baseMessage += "Reduce approximately " + weeklyReductionNeeded + " kg CO₂ next week to stay on track.";
        }

        return GoalAlertDTO.builder()
                .alertType("GOAL_BEHIND")
                .severity(prediction.getPredictionStatus().equals("BEHIND_SCHEDULE") ? "WARNING" : "INFO")
                .message(baseMessage)
                .relatedGoalId(goal.getId())
                .build();
    }
    
    private Map<ActivityType, BigDecimal> aggregateByCategory(List<ActivityLog> logs) {
        Map<ActivityType, BigDecimal> totals = new HashMap<>();
        for (ActivityLog log : logs) {
            totals.merge(log.getActivityType(), log.getEmissionValue(), BigDecimal::add);
        }
        return totals;
    }
    
    private String formatCategoryName(String type) {
        if (type == null) return "activity";
        return type.replace("_", " ").toLowerCase();
    }
}
