package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.GoalCreateRequest;
import com.carbonfootprint.dto.GoalResponse;
import com.carbonfootprint.entity.Goal;
import com.carbonfootprint.entity.GoalStatus;
import com.carbonfootprint.entity.GoalType;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.GoalRepository;
import com.carbonfootprint.repository.GoalHistoryRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.entity.GoalHistory;
import com.carbonfootprint.dto.GoalUpdateRequest;
import com.carbonfootprint.dto.GoalStatusUpdateRequest;
import com.carbonfootprint.dto.GoalHistoryResponse;
import com.carbonfootprint.entity.NotificationType;
import com.carbonfootprint.service.GoalService;
import com.carbonfootprint.service.NotificationService;
import com.carbonfootprint.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final GoalHistoryRepository goalHistoryRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final GeminiService geminiService;

    @Override
    @Transactional
    public GoalResponse createGoal(Long userId, GoalCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Goal goal = Goal.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .goalType(request.getGoalType())
                .startDate(request.getStartDate())
                .targetDate(request.getTargetDate())
                .status(GoalStatus.IN_PROGRESS)
                .progressPercent(BigDecimal.ZERO)
                .build();

        if (request.getGoalType() == GoalType.PERCENTAGE_REDUCTION || isCategoryGoal(request.getGoalType())) {
            goal.setTargetReductionPercent(request.getTargetReductionPercent());
            // Calculate Baseline
            long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getTargetDate());
            if (days <= 0) days = 30; // Fallback
            
            LocalDate pastStartDate = request.getStartDate().minusDays(days);
            LocalDate pastEndDate = request.getStartDate().minusDays(1);
            
            BigDecimal baseline = getEmissionsForPeriodAndType(userId, request.getGoalType(), pastStartDate, pastEndDate);
            goal.setBaselineEmission(baseline);
            
            // Calculate target emission based on reduction
            if (baseline != null && baseline.compareTo(BigDecimal.ZERO) > 0 && request.getTargetReductionPercent() != null) {
                BigDecimal reductionFactor = BigDecimal.ONE.subtract(request.getTargetReductionPercent().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
                goal.setTargetEmission(baseline.multiply(reductionFactor).setScale(2, RoundingMode.HALF_UP));
            } else {
                goal.setTargetEmission(request.getTargetEmission());
            }
        } else {
            goal.setTargetEmission(request.getTargetEmission());
        }

        Goal savedGoal = goalRepository.save(goal);
        
        notificationService.createNotification(
                user, 
                NotificationType.GOAL_CREATED, 
                savedGoal.getId(), 
                savedGoal.getName(), 
                savedGoal.getStatus().name(), 
                "0%", 
                savedGoal.getTargetEmission() != null ? savedGoal.getTargetEmission().toString() + " kg CO2e" : "N/A", 
                ChronoUnit.DAYS.between(LocalDate.now(), savedGoal.getTargetDate()) + " days", 
                "Start logging activities to see progress on your new goal.", 
                "Log Activity",
                null);

        return mapToResponse(savedGoal);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoalResponse> getUserGoals(Long userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GoalResponse getGoalDetails(Long goalId, Long userId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        return mapToResponse(goal);
    }

    @Override
    @Transactional
    public GoalResponse updateGoal(Long goalId, Long userId, GoalUpdateRequest request) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (request.getName() != null) goal.setName(request.getName());
        if (request.getDescription() != null) goal.setDescription(request.getDescription());
        if (request.getTargetDate() != null) goal.setTargetDate(request.getTargetDate());
        if (request.getTargetEmission() != null) goal.setTargetEmission(request.getTargetEmission());
        if (request.getTargetReductionPercent() != null) goal.setTargetReductionPercent(request.getTargetReductionPercent());

        Goal updatedGoal = goalRepository.save(goal);
        
        notificationService.createNotification(
                updatedGoal.getUser(), 
                NotificationType.GOAL_UPDATED, 
                updatedGoal.getId(), 
                updatedGoal.getName(), 
                updatedGoal.getStatus().name(), 
                updatedGoal.getProgressPercent() != null ? updatedGoal.getProgressPercent() + "%" : "0%", 
                updatedGoal.getTargetEmission() != null ? updatedGoal.getTargetEmission().toString() + " kg CO2e" : "N/A", 
                ChronoUnit.DAYS.between(LocalDate.now(), updatedGoal.getTargetDate()) + " days", 
                "Your goal settings have been updated.", 
                "View Goal",
                null);
                
        return mapToResponse(updatedGoal);
    }

    @Override
    @Transactional
    public GoalResponse changeGoalStatus(Long goalId, Long userId, GoalStatusUpdateRequest request) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        GoalStatus previousStatus = goal.getStatus();
        goal.setStatus(request.getStatus());
        Goal updatedGoal = goalRepository.save(goal);

        GoalHistory history = GoalHistory.builder()
                .goal(updatedGoal)
                .user(updatedGoal.getUser())
                .previousStatus(previousStatus)
                .newStatus(request.getStatus())
                .changeReason(request.getReason())
                .build();
        goalHistoryRepository.save(history);
        
        NotificationType notifType = NotificationType.GOAL_UPDATED;
        if (request.getStatus() == GoalStatus.ACHIEVED) notifType = NotificationType.GOAL_COMPLETED;
        else if (request.getStatus() == GoalStatus.FAILED) notifType = NotificationType.GOAL_FAILED;
        else if (request.getStatus() == GoalStatus.CANCELLED) notifType = NotificationType.GOAL_CANCELLED;
        else if (request.getStatus() == GoalStatus.PAUSED) notifType = NotificationType.GOAL_PAUSED;
        else if (request.getStatus() == GoalStatus.IN_PROGRESS && previousStatus == GoalStatus.PAUSED) notifType = NotificationType.GOAL_RESUMED;

        notificationService.createNotification(
                updatedGoal.getUser(), 
                notifType, 
                updatedGoal.getId(), 
                updatedGoal.getName(), 
                updatedGoal.getStatus().name(), 
                updatedGoal.getProgressPercent() != null ? updatedGoal.getProgressPercent() + "%" : "0%", 
                updatedGoal.getTargetEmission() != null ? updatedGoal.getTargetEmission().toString() + " kg CO2e" : "N/A", 
                ChronoUnit.DAYS.between(LocalDate.now(), updatedGoal.getTargetDate()) + " days", 
                "Goal status changed to " + request.getStatus().name(), 
                "View Goal",
                null);

        return mapToResponse(updatedGoal);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoalHistoryResponse> getGoalHistory(Long goalId, Long userId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        return goalHistoryRepository.findByGoalIdOrderByChangedAtDesc(goalId).stream()
                .map(h -> GoalHistoryResponse.builder()
                        .id(h.getId())
                        .goalId(h.getGoal().getId())
                        .previousStatus(h.getPreviousStatus())
                        .newStatus(h.getNewStatus())
                        .changeReason(h.getChangeReason())
                        .changedAt(h.getChangedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteGoal(Long goalId, Long userId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        goalHistoryRepository.deleteByGoalId(goalId);
        goalRepository.delete(goal);
        
        notificationService.createNotification(
                goal.getUser(), 
                NotificationType.GOAL_DELETED, 
                goal.getId(), 
                goal.getName(), 
                "DELETED", 
                "N/A", 
                "N/A", 
                "N/A", 
                "You have removed a goal from your tracking.", 
                "View Dashboard",
                null);
    }

    @Override
    @Transactional
    public void evaluateUserGoals(Long userId) {
        List<Goal> activeGoals = goalRepository.findByUserIdAndStatus(userId, GoalStatus.IN_PROGRESS);
        LocalDate today = LocalDate.now();

        for (Goal goal : activeGoals) {
            // Skip evaluation for goals created today to avoid instant failure spam
            if (goal.getCreatedAt() != null && goal.getCreatedAt().toLocalDate().isEqual(today)) {
                continue;
            }

            BigDecimal currentEmissions = getEmissionsForPeriodAndType(goal.getUser().getId(), goal.getGoalType(), goal.getStartDate(), today);
            if (currentEmissions == null) currentEmissions = BigDecimal.ZERO;

            if (goal.getTargetEmission() != null && goal.getTargetEmission().compareTo(BigDecimal.ZERO) > 0) {
                // Determine if we are over the target
                if (currentEmissions.compareTo(goal.getTargetEmission()) >= 0) {
                    if (today.isBefore(goal.getTargetDate()) || today.isEqual(goal.getTargetDate())) {
                         goal.setStatus(GoalStatus.FAILED);
                         goal.setProgressPercent(BigDecimal.valueOf(100));
                         triggerEvaluationNotification(goal, NotificationType.GOAL_FAILED, currentEmissions, today);
                    }
                } else {
                    if (today.isAfter(goal.getTargetDate())) {
                         goal.setStatus(GoalStatus.ACHIEVED);
                         goal.setProgressPercent(BigDecimal.valueOf(100));
                         triggerEvaluationNotification(goal, NotificationType.GOAL_COMPLETED, currentEmissions, today);
                    } else {
                         BigDecimal progress = currentEmissions.divide(goal.getTargetEmission(), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
                         goal.setProgressPercent(progress.min(BigDecimal.valueOf(100)));
                         triggerProgressNotificationIfNeeded(goal, currentEmissions, today);
                    }
                }
            } else {
                 if (today.isAfter(goal.getTargetDate())) {
                      goal.setStatus(GoalStatus.ACHIEVED);
                      triggerEvaluationNotification(goal, NotificationType.GOAL_COMPLETED, currentEmissions, today);
                 }
            }
            goalRepository.save(goal);
        }
    }

    @Override
    @Transactional
    public void evaluateGoals() {
        // Find all in-progress goals
        List<Goal> activeGoals = goalRepository.findByStatus(GoalStatus.IN_PROGRESS);
        LocalDate today = LocalDate.now();

        for (Goal goal : activeGoals) {
            // Skip evaluation for goals created today to avoid instant failure spam
            if (goal.getCreatedAt() != null && goal.getCreatedAt().toLocalDate().isEqual(today)) {
                continue;
            }

            BigDecimal currentEmissions = getEmissionsForPeriodAndType(goal.getUser().getId(), goal.getGoalType(), goal.getStartDate(), today);
            if (currentEmissions == null) currentEmissions = BigDecimal.ZERO;

            if (goal.getTargetEmission() != null && goal.getTargetEmission().compareTo(BigDecimal.ZERO) > 0) {
                // Determine if we are over the target
                if (currentEmissions.compareTo(goal.getTargetEmission()) >= 0) {
                    // Failed if we have exceeded target emission (assuming reduction goals where lower is better)
                    if (today.isBefore(goal.getTargetDate()) || today.isEqual(goal.getTargetDate())) {
                         goal.setStatus(GoalStatus.FAILED);
                         goal.setProgressPercent(BigDecimal.valueOf(100));
                         triggerEvaluationNotification(goal, NotificationType.GOAL_FAILED, currentEmissions, today);
                    }
                } else {
                    // Calculate progress based on how close we are to the limit
                    BigDecimal progress = currentEmissions.divide(goal.getTargetEmission(), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
                    goal.setProgressPercent(progress.setScale(2, RoundingMode.HALF_UP));

                    // Estimate completion date (when it hits 100%)
                    long daysPassed = ChronoUnit.DAYS.between(goal.getStartDate(), today);
                    if (daysPassed > 0 && currentEmissions.compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal dailyAvg = currentEmissions.divide(BigDecimal.valueOf(daysPassed), 4, RoundingMode.HALF_UP);
                        BigDecimal remaining = goal.getTargetEmission().subtract(currentEmissions);
                        int daysRemaining = remaining.divide(dailyAvg, 0, RoundingMode.HALF_UP).intValue();
                        goal.setEstimatedCompletionDate(today.plusDays(daysRemaining));
                    }

                    if (today.isAfter(goal.getTargetDate())) {
                        goal.setStatus(GoalStatus.ACHIEVED); // Stayed under cap!
                        triggerEvaluationNotification(goal, NotificationType.GOAL_COMPLETED, currentEmissions, today);
                    } else {
                        triggerProgressNotificationIfNeeded(goal, currentEmissions, today);
                    }
                }
            } else {
                 if (today.isAfter(goal.getTargetDate())) {
                      goal.setStatus(GoalStatus.ACHIEVED);
                      triggerEvaluationNotification(goal, NotificationType.GOAL_COMPLETED, currentEmissions, today);
                 }
            }
            goalRepository.save(goal);
        }
    }

    private void triggerEvaluationNotification(Goal goal, NotificationType type, BigDecimal currentEmissions, LocalDate today) {
        String msg;
        String aiSummary = "";
        String metaData = null;
        
        if (type == NotificationType.GOAL_COMPLETED) {
            BigDecimal baseline = goal.getBaselineEmission() != null ? goal.getBaselineEmission() : BigDecimal.ZERO;
            BigDecimal target = goal.getTargetEmission() != null ? goal.getTargetEmission() : BigDecimal.ZERO;
            BigDecimal saved = baseline.subtract(currentEmissions).max(BigDecimal.ZERO);
            
            String carbonSavedStr = saved.setScale(2, RoundingMode.HALF_UP) + " kg CO2e";
            String reductionStr = "0%";
            if (baseline.compareTo(BigDecimal.ZERO) > 0) {
                reductionStr = saved.divide(baseline, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_UP) + "%";
            }
            
            String prompt = String.format("The user '%s' has successfully completed their goal '%s'! " +
                    "They reduced their emissions by %s (%s reduction). " +
                    "Write a very enthusiastic 2-sentence congratulatory message summarizing their positive environmental impact.",
                    goal.getUser().getFirstName(), goal.getName(), carbonSavedStr, reductionStr);
                    
            aiSummary = geminiService.generateAIResponse(prompt);
            if (aiSummary == null || aiSummary.isEmpty()) {
                aiSummary = "Incredible job! Your dedication to reducing your carbon footprint makes a real difference for our planet.";
            }
            
            msg = "Congratulations! You have achieved your goal. " + aiSummary;
            metaData = String.format("{\"carbonSaved\":\"%s\", \"totalReduction\":\"%s\", \"aiSummary\":\"%s\"}", 
                                      carbonSavedStr, reductionStr, aiSummary.replace("\"", "\\\""));
            
            // Send Email
            Map<String, Object> emailData = new HashMap<>();
            emailData.put("userName", goal.getUser().getFirstName() != null ? goal.getUser().getFirstName() : "User");
            emailData.put("goalName", goal.getName());
            emailData.put("carbonSaved", carbonSavedStr);
            emailData.put("totalReduction", reductionStr);
            emailData.put("aiSummary", aiSummary);
            emailData.put("targetEmissions", target.toString() + " kg CO2e");
            emailData.put("completionDate", today.toString());
            emailData.put("actionLink", "/dashboard");
            
            emailService.sendGoalCompletedEmail(goal.getUser().getEmail(), "Goal Achieved: " + goal.getName(), emailData);
        } else if (type == NotificationType.GOAL_FAILED) {
            BigDecimal target = goal.getTargetEmission() != null ? goal.getTargetEmission() : BigDecimal.ZERO;
            BigDecimal overage = currentEmissions.subtract(target).max(BigDecimal.ZERO);
            
            String currentEmissionsStr = currentEmissions.setScale(2, RoundingMode.HALF_UP) + " kg CO2e";
            String overageStr = overage.setScale(2, RoundingMode.HALF_UP) + " kg CO2e";
            String targetStr = target.toString() + " kg CO2e";
            
            String prompt = String.format("The user '%s' failed their carbon reduction goal '%s'. " +
                    "They exceeded their target of %s by %s, resulting in a total of %s. " +
                    "Write a 2-sentence encouraging and constructive message with a brief actionable recovery suggestion.",
                    goal.getUser().getFirstName(), goal.getName(), targetStr, overageStr, currentEmissionsStr);
                    
            aiSummary = geminiService.generateAIResponse(prompt);
            if (aiSummary == null || aiSummary.isEmpty()) {
                aiSummary = "Don't be discouraged! Let's review your recent high-emission activities and set a more manageable target for the next period.";
            }
            
            msg = "Goal Unmet: " + aiSummary;
            metaData = String.format("{\"currentEmissions\":\"%s\", \"remainingDifference\":\"%s\", \"aiSummary\":\"%s\", \"targetEmissions\":\"%s\"}", 
                                      currentEmissionsStr, overageStr, aiSummary.replace("\"", "\\\""), targetStr);
            
            // Send Email
            Map<String, Object> emailData = new HashMap<>();
            emailData.put("userName", goal.getUser().getFirstName() != null ? goal.getUser().getFirstName() : "User");
            emailData.put("goalName", goal.getName());
            emailData.put("currentEmissions", currentEmissionsStr);
            emailData.put("remainingDifference", overageStr);
            emailData.put("aiSummary", aiSummary);
            emailData.put("targetEmissions", targetStr);
            emailData.put("actionLink", "/dashboard");
            
            emailService.sendGoalFailedEmail(goal.getUser().getEmail(), "Goal Review: " + goal.getName(), emailData);
        } else {
            msg = "Unfortunately, you have exceeded your emissions target.";
        }

        notificationService.createNotification(
                goal.getUser(),
                type,
                goal.getId(),
                goal.getName(),
                goal.getStatus().name(),
                goal.getProgressPercent() != null ? goal.getProgressPercent() + "%" : "100%",
                goal.getTargetEmission() != null ? goal.getTargetEmission().toString() + " kg CO2e" : "N/A",
                "0 days",
                msg,
                "View Goal",
                metaData
        );
    }

    private void triggerProgressNotificationIfNeeded(Goal goal, BigDecimal currentEmissions, LocalDate today) {
        long daysUntilDeadline = ChronoUnit.DAYS.between(today, goal.getTargetDate());
        
        // Example: Notify if within 3 days of deadline and still in progress
        if (daysUntilDeadline == 3) {
            notificationService.createNotification(
                    goal.getUser(),
                    NotificationType.GOAL_NEAR_DEADLINE,
                    goal.getId(),
                    goal.getName(),
                    goal.getStatus().name(),
                    goal.getProgressPercent() != null ? goal.getProgressPercent() + "%" : "0%",
                    goal.getTargetEmission() != null ? goal.getTargetEmission().toString() + " kg CO2e" : "N/A",
                    daysUntilDeadline + " days",
                    "Your goal deadline is approaching. Keep up the good work!",
                    "View Goal",
                    null
            );
        } else if (today.getDayOfWeek().getValue() == 1) { // Notify on Mondays (Weekly Progress)
             notificationService.createNotification(
                    goal.getUser(),
                    NotificationType.WEEKLY_PROGRESS,
                    goal.getId(),
                    goal.getName(),
                    goal.getStatus().name(),
                    goal.getProgressPercent() != null ? goal.getProgressPercent() + "%" : "0%",
                    goal.getTargetEmission() != null ? goal.getTargetEmission().toString() + " kg CO2e" : "N/A",
                    daysUntilDeadline + " days",
                    "Here is your weekly progress update.",
                    "View Goal",
                    null
            );
        }
    }

    private boolean isCategoryGoal(GoalType type) {
        return type == GoalType.TRANSPORT || type == GoalType.ELECTRICITY || 
               type == GoalType.FOOD || type == GoalType.SHOPPING || type == GoalType.OTHER_ACTIVITIES;
    }

    private BigDecimal getEmissionsForPeriodAndType(Long userId, GoalType type, LocalDate start, LocalDate end) {
        if (!isCategoryGoal(type)) {
            BigDecimal sum = activityLogRepository.sumEmissionsByUserIdAndDateRange(userId, start, end);
            return sum != null ? sum : BigDecimal.ZERO;
        }

        String categoryName = mapTypeToCategoryName(type);
        List<Object[]> categorySums = activityLogRepository.sumEmissionsByCategoryAndDateRange(userId, start, end);
        for (Object[] row : categorySums) {
            if (categoryName.equalsIgnoreCase((String) row[0])) {
                return (BigDecimal) row[1];
            }
        }
        return BigDecimal.ZERO;
    }

    private String mapTypeToCategoryName(GoalType type) {
        switch (type) {
            case TRANSPORT: return "Transport";
            case ELECTRICITY: return "Home Energy";
            case FOOD: return "Food & Diet";
            case SHOPPING: return "Shopping";
            default: return "Other";
        }
    }

    private GoalResponse mapToResponse(Goal goal) {
        return GoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .description(goal.getDescription())
                .goalType(goal.getGoalType())
                .startDate(goal.getStartDate())
                .targetDate(goal.getTargetDate())
                .targetReductionPercent(goal.getTargetReductionPercent())
                .targetEmission(goal.getTargetEmission())
                .baselineEmission(goal.getBaselineEmission())
                .status(goal.getStatus())
                .progressPercent(goal.getProgressPercent())
                .estimatedCompletionDate(goal.getEstimatedCompletionDate())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}
