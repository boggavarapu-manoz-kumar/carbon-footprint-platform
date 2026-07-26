package com.carbonfootprint.service.impl;

import com.carbonfootprint.entity.*;
import com.carbonfootprint.event.AchievementUnlockedEvent;
import com.carbonfootprint.event.UserMetricsUpdatedEvent;
import com.carbonfootprint.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MilestoneRuleEngine {

    private final UserRepository userRepository;
    private final UserSustainabilityProfileRepository profileRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ActivityLogRepository activityRepository;
    private final GoalRepository goalRepository;
    private final WeeklyLeaderboardHistoryRepository weeklyLeaderboardHistoryRepository;
    private final YearlyLeaderboardHistoryRepository yearlyLeaderboardHistoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    @EventListener
    @Transactional
    public void evaluateRulesForUser(UserMetricsUpdatedEvent event) {
        Long userId = event.getUserId();
        log.info("Dynamic Rule Engine evaluating rules for user: {}", userId);

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        UserSustainabilityProfile profile = profileRepository.findByUserId(userId).orElse(null);
        if (profile == null) return;

        // Fetch all active badges with a configured rule
        List<Badge> activeBadges = badgeRepository.findAll().stream()
                .filter(b -> b.getStatus() == BadgeStatus.ACTIVE && b.getRuleType() != null && b.getRuleTarget() != null)
                .toList();

        // Evaluate each badge dynamically
        for (Badge badge : activeBadges) {
            boolean isEligible = checkRuleCriteria(user, profile, badge);

            if (isEligible) {
                // Check if user already has this badge
                boolean alreadyAwarded = userBadgeRepository.existsByUserAndBadge(user, badge);
                if (!alreadyAwarded) {
                    log.info("User {} met dynamic criteria for badge {}. Firing AchievementUnlockedEvent.", userId, badge.getName());
                    eventPublisher.publishEvent(new AchievementUnlockedEvent(
                            this,
                            userId,
                            badge.getName(),
                            badge.getDescription(),
                            badge.getCriteria()
                    ));
                }
            }
        }
    }

    private boolean checkRuleCriteria(User user, UserSustainabilityProfile profile, Badge badge) {
        MilestoneRuleType ruleType = badge.getRuleType();
        try {
            Integer target = badge.getRuleTarget();
            
            switch (ruleType) {
                case STREAK:
                    return profile.getCurrentStreak() >= target;
                
                case CARBON_REDUCED:
                    return profile.getTotalCarbonSaved().doubleValue() >= target;
                
                case ACTIVITY_COUNT:
                    long activityCount = 0;
                    if (badge.getCategory() != null && !badge.getCategory().isEmpty()) {
                        activityCount = activityRepository.countByUserIdAndCategory(user.getId(), badge.getCategory());
                    } else {
                        activityCount = activityRepository.countByUserId(user.getId());
                    }
                    return activityCount >= target;
                
                case GOAL_CREATED:
                    long goalCreatedCount = goalRepository.countByUserId(user.getId());
                    return goalCreatedCount >= target;
                
                case GOAL_COMPLETED:
                    long goalCount = goalRepository.findByUserIdAndStatus(user.getId(), GoalStatus.ACHIEVED).size();
                    return goalCount >= target;
                
                case RECOMMENDATION_FOLLOWED:
                    return profile.getAdoptedRecommendationsCount() >= target;
                
                case LEADERBOARD_RANK:
                    // Check if they ever achieved this rank in weekly or yearly history
                    // target rank means they should be <= target (e.g. rank 1 means top 1)
                    var bestWeekly = weeklyLeaderboardHistoryRepository.findTopByUserOrderByRankAsc(user);
                    if (bestWeekly.isPresent() && bestWeekly.get().getRank() != null && bestWeekly.get().getRank() <= target) {
                        return true;
                    }
                    
                    var bestYearly = yearlyLeaderboardHistoryRepository.findTopByUserOrderByRankAsc(user);
                    return bestYearly.isPresent() && bestYearly.get().getRank() != null && bestYearly.get().getRank() <= target;
                    
                default:
                    return false;
            }
        } catch (Exception e) {
            log.error("Error evaluating rule type {} for user {}: {}", ruleType, user.getId(), e.getMessage());
            return false;
        }
    }
}
