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
import com.carbonfootprint.service.GoalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final GoalHistoryRepository goalHistoryRepository;

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
    }

    @Override
    @Transactional
    public void evaluateUserGoals(Long userId) {
        List<Goal> activeGoals = goalRepository.findByUserIdAndStatus(userId, GoalStatus.IN_PROGRESS);
        LocalDate today = LocalDate.now();

        for (Goal goal : activeGoals) {
            BigDecimal currentEmissions = getEmissionsForPeriodAndType(goal.getUser().getId(), goal.getGoalType(), goal.getStartDate(), today);
            if (currentEmissions == null) currentEmissions = BigDecimal.ZERO;

            if (goal.getTargetEmission() != null && goal.getTargetEmission().compareTo(BigDecimal.ZERO) > 0) {
                // Determine if we are over the target
                if (currentEmissions.compareTo(goal.getTargetEmission()) >= 0) {
                    if (today.isBefore(goal.getTargetDate()) || today.isEqual(goal.getTargetDate())) {
                         goal.setStatus(GoalStatus.FAILED);
                         goal.setProgressPercent(BigDecimal.valueOf(100));
                    }
                } else {
                    if (today.isAfter(goal.getTargetDate())) {
                         goal.setStatus(GoalStatus.ACHIEVED);
                         goal.setProgressPercent(BigDecimal.valueOf(100));
                    } else {
                         BigDecimal progress = currentEmissions.divide(goal.getTargetEmission(), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
                         goal.setProgressPercent(progress.min(BigDecimal.valueOf(100)));
                    }
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
            BigDecimal currentEmissions = getEmissionsForPeriodAndType(goal.getUser().getId(), goal.getGoalType(), goal.getStartDate(), today);
            if (currentEmissions == null) currentEmissions = BigDecimal.ZERO;

            if (goal.getTargetEmission() != null && goal.getTargetEmission().compareTo(BigDecimal.ZERO) > 0) {
                // Determine if we are over the target
                if (currentEmissions.compareTo(goal.getTargetEmission()) >= 0) {
                    // Failed if we have exceeded target emission (assuming reduction goals where lower is better)
                    if (today.isBefore(goal.getTargetDate()) || today.isEqual(goal.getTargetDate())) {
                         goal.setStatus(GoalStatus.FAILED);
                         goal.setProgressPercent(BigDecimal.valueOf(100));
                    }
                } else {
                    // Calculate progress based on how close we are to the limit
                    // Since it's a reduction/limit goal, reaching 100% means hitting the cap. 
                    // Wait, usually progress in a goal means you're doing well.
                    // For a target of 100kg, if I emit 20kg, I have "used up" 20%. 
                    // Let's set progressPercent as (currentEmissions / targetEmission) * 100
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
                    }
                }
            } else {
                 if (today.isAfter(goal.getTargetDate())) {
                      goal.setStatus(GoalStatus.ACHIEVED);
                 }
            }
            goalRepository.save(goal);
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
            case TRANSPORT: return "Transportation";
            case ELECTRICITY: return "Energy";
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
