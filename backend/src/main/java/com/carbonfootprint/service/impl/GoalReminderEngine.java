package com.carbonfootprint.service.impl;

import com.carbonfootprint.entity.Goal;
import com.carbonfootprint.entity.GoalStatus;
import com.carbonfootprint.entity.NotificationType;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.GoalRepository;
import com.carbonfootprint.service.EmailService;
import com.carbonfootprint.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoalReminderEngine {

    private final GoalRepository goalRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final GeminiService geminiService;

    /**
     * Scheduled to run daily at 8:00 AM server time.
     * Can also be manually invoked for testing.
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void evaluateAndSendReminders() {
        log.info("Starting Goal Reminder Engine...");
        
        List<Goal> activeGoals = goalRepository.findByStatus(GoalStatus.IN_PROGRESS);
        LocalDate today = LocalDate.now();

        for (Goal goal : activeGoals) {
            try {
                processGoal(goal, today);
            } catch (Exception e) {
                log.error("Failed to process reminders for goal {}: {}", goal.getId(), e.getMessage());
            }
        }
        
        log.info("Goal Reminder Engine completed successfully.");
    }

    private void processGoal(Goal goal, LocalDate today) {
        long totalDurationDays = ChronoUnit.DAYS.between(goal.getStartDate(), goal.getTargetDate());
        long remainingDays = ChronoUnit.DAYS.between(today, goal.getTargetDate());

        if (remainingDays < 0) {
            return; // Deadline passed, handled by evaluation service
        }

        boolean shouldRemind = false;

        // Dynamic Frequency Calculation
        if (totalDurationDays == 30 || totalDurationDays > 14) {
            // Weekly reminder for 30+ day goals, plus near-deadline
            if (remainingDays == 28 || remainingDays == 21 || remainingDays == 14 || 
                remainingDays == 7 || remainingDays == 3 || remainingDays == 1 || remainingDays == 0) {
                shouldRemind = true;
            }
        } else {
            // Daily or frequent reminder for short-term goals (<= 14 days)
            // Includes 7 day goals (days 7, 6, 5, 4, 3, 2, 1, 0)
            shouldRemind = true; 
        }

        if (shouldRemind) {
            sendReminder(goal, remainingDays);
        }
    }

    private void sendReminder(Goal goal, long remainingDays) {
        User user = goal.getUser();
        
        // Calculate Metrics
        String currentProgress = (goal.getProgressPercent() != null ? goal.getProgressPercent() : BigDecimal.ZERO) + "%";
        
        // Target - Emissions
        // We calculate remaining carbon if we have progress %
        String remainingCarbon = "N/A";
        if (goal.getTargetEmission() != null && goal.getProgressPercent() != null) {
            BigDecimal progressFraction = goal.getProgressPercent().divide(BigDecimal.valueOf(100));
            BigDecimal currentEmissions = goal.getTargetEmission().multiply(progressFraction);
            BigDecimal remaining = goal.getTargetEmission().subtract(currentEmissions).max(BigDecimal.ZERO);
            remainingCarbon = remaining.setScale(2, java.math.RoundingMode.HALF_UP) + " kg CO2e";
        }

        String remainingDaysStr = remainingDays == 0 ? "Today" : remainingDays + " days";
        
        String estSuccess = "N/A";
        if (goal.getEstimatedCompletionDate() != null) {
            estSuccess = goal.getEstimatedCompletionDate().isAfter(goal.getTargetDate()) ? "Off Track" : "On Track";
        }

        // Generate AI Recommendation
        String prompt = String.format("The user '%s' has a goal to reduce their carbon footprint (Goal: %s, Target: %s). " +
                "They have %d days remaining and are currently at %s progress. " +
                "Their estimated trajectory is %s. " +
                "Give them a single, concise, professional 2-sentence encouraging recommendation on how to achieve their goal.",
                user.getFirstName(), goal.getName(), goal.getTargetEmission() != null ? goal.getTargetEmission() + " kg CO2e" : "N/A",
                remainingDays, currentProgress, estSuccess);

        String aiRecommendation = geminiService.generateAIResponse(prompt);
        if (aiRecommendation == null || aiRecommendation.isEmpty()) {
            aiRecommendation = "Stay focused on your activities and review your daily footprint to ensure you reach your goal on time.";
        }

        String title = "Goal Reminder: " + remainingDaysStr + " Remaining";
        if (remainingDays == 0) title = "Goal Deadline: Ends Today";

        String description = "Here is an update on your goal progress. Keep going!";

        // 1. In-App Notification
        notificationService.createNotification(
                user,
                NotificationType.GOAL_REMINDER,
                goal.getId(),
                goal.getName(),
                goal.getStatus().name(),
                currentProgress,
                remainingCarbon,
                remainingDaysStr,
                description + " " + aiRecommendation,
                "View Goal",
                null
        );

        // 2. Email Notification
        Map<String, Object> emailData = new HashMap<>();
        emailData.put("userName", user.getFirstName() != null ? user.getFirstName() : "User");
        emailData.put("title", title);
        emailData.put("description", description);
        emailData.put("goalName", goal.getName());
        emailData.put("currentProgress", currentProgress);
        emailData.put("remainingCarbon", remainingCarbon);
        emailData.put("remainingDays", remainingDaysStr);
        emailData.put("recommendation", aiRecommendation);
        emailData.put("actionLink", "/dashboard/goals");
        emailData.put("nextAction", "View Your Goal");

        emailService.sendGoalNotificationEmail(user.getEmail(), title, emailData);
        
        log.info("Sent reminder for goal {} to user {}", goal.getId(), user.getEmail());
    }
}
