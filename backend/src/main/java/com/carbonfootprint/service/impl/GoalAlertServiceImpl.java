package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.GoalAlertDTO;
import com.carbonfootprint.dto.GoalPredictionDTO;
import com.carbonfootprint.entity.ActivityLog;
import com.carbonfootprint.entity.ActivityType;
import com.carbonfootprint.entity.Goal;
import com.carbonfootprint.entity.GoalStatus;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.GoalRepository;
import com.carbonfootprint.service.GoalAlertService;
import com.carbonfootprint.service.GoalPredictionService;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class GoalAlertServiceImpl implements GoalAlertService {

    private final GoalRepository goalRepository;
    private final ActivityLogRepository activityLogRepository;
    private final GoalPredictionService goalPredictionService;

    @Override
    public List<GoalAlertDTO> getGoalAlerts(Long userId) {
        List<GoalAlertDTO> alerts = new ArrayList<>();
        
        List<Goal> activeGoals = goalRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(g -> g.getStatus() == GoalStatus.IN_PROGRESS)
                .collect(Collectors.toList());

        for (Goal goal : activeGoals) {
            GoalPredictionDTO prediction = goalPredictionService.getGoalPrediction(goal.getId(), userId);
            
            if ("ON_TRACK".equals(prediction.getPredictionStatus())) {
                alerts.add(buildEncouragementAlert(goal, prediction));
            } else if ("BEHIND_SCHEDULE".equals(prediction.getPredictionStatus()) || "SLIGHTLY_BEHIND".equals(prediction.getPredictionStatus())) {
                alerts.add(buildCorrectionAlert(goal, prediction, userId));
            }
        }
        
        return alerts;
    }

    private GoalAlertDTO buildEncouragementAlert(Goal goal, GoalPredictionDTO prediction) {
        String message = "Excellent work on '" + goal.getName() + "'! You're ahead of schedule and projected to finish at " + 
                         prediction.getProjectedCarbon() + " kg CO₂e.";
                         
        return GoalAlertDTO.builder()
                .alertType("ENCOURAGEMENT")
                .severity("SUCCESS")
                .message(message)
                .relatedGoalId(goal.getId())
                .build();
    }

    private GoalAlertDTO buildCorrectionAlert(Goal goal, GoalPredictionDTO prediction, Long userId) {
        LocalDate today = LocalDate.now();
        long daysRemaining = ChronoUnit.DAYS.between(today, goal.getTargetDate());
        
        String baseMessage = "You're falling behind your goal '" + goal.getName() + "'. ";
        
        if (daysRemaining > 0 && prediction.getProjectedCarbon().compareTo(goal.getTargetEmission()) > 0) {
            BigDecimal surplus = prediction.getProjectedCarbon().subtract(goal.getTargetEmission());
            // How much to reduce per week to get back on track
            BigDecimal weeklyReductionNeeded = surplus.divide(BigDecimal.valueOf(Math.max(1, daysRemaining / 7.0)), 2, RoundingMode.HALF_UP);
            
            baseMessage += "You need to reduce approximately " + weeklyReductionNeeded + " kg CO₂e this week to stay on track. ";
        }

        // Analyze week-over-week worst category
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
            baseMessage += categoryName + " emissions increased this week.";
        }

        return GoalAlertDTO.builder()
                .alertType("CORRECTION")
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
        if (type == null) return "Activity";
        type = type.replace("_", " ").toLowerCase();
        return type.substring(0, 1).toUpperCase() + type.substring(1);
    }
}
