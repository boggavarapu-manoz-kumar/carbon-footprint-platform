package com.carbonfootprint.service.impl;

import com.carbonfootprint.entity.PointHistory;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.entity.UserSustainabilityProfile;
import com.carbonfootprint.event.GamificationEvent;
import com.carbonfootprint.repository.PointHistoryRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.repository.UserSustainabilityProfileRepository;
import com.carbonfootprint.service.GamificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import com.carbonfootprint.event.UserMetricsUpdatedEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationServiceImpl implements GamificationService {

    private final UserSustainabilityProfileRepository profileRepository;
    private final PointHistoryRepository pointHistoryRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final com.carbonfootprint.repository.GamificationConfigRepository configRepository;
    private final com.carbonfootprint.repository.LevelConfigRepository levelRepository;

    @Async
    @EventListener
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    @Override
    public void handleGamificationEvent(GamificationEvent event) {
        log.info("Received GamificationEvent: {} (Action: {}) for user {}", event.getEventType(), event.getActionType(), event.getUserId());
        
        Optional<User> userOpt = userRepository.findById(event.getUserId());
        if (userOpt.isEmpty()) return;
        
        User user = userOpt.get();
        UserSustainabilityProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> createProfile(user));

        if (event.getEventType() == GamificationEvent.EventType.ACTIVITY_DELETED) {
            revokePoints(user, profile, event);
            return;
        }

        if (event.getActionType() != null) {
            // Dynamic Config Execution
            processDynamicRule(user, profile, event);
        }

        // Custom streak logic wrapper (if activity logged)
        if (event.getEventType() == GamificationEvent.EventType.ACTIVITY_LOGGED) {
            updateStreak(user, profile);
        }
    }

    private void processDynamicRule(User user, UserSustainabilityProfile profile, GamificationEvent event) {
        Optional<com.carbonfootprint.entity.GamificationConfig> configOpt = configRepository.findByActionType(event.getActionType());
        if (configOpt.isEmpty() || !configOpt.get().getIsActive()) {
            return;
        }
        com.carbonfootprint.entity.GamificationConfig config = configOpt.get();

        // 1. Anti-duplication by Reference ID
        if (event.getReferenceId() != null && pointHistoryRepository.existsByUserIdAndReferenceIdAndReason(user.getId(), event.getReferenceId(), event.getActionType())) {
            log.info("Points already awarded for referenceId: {}", event.getReferenceId());
            return;
        }

        // 2. Daily limit check
        if (config.getMaxDailyLimit() != null) {
            int countToday = pointHistoryRepository.countByUserIdAndActionTypeToday(user.getId(), event.getActionType(), LocalDate.now().atStartOfDay());
            if (countToday >= config.getMaxDailyLimit()) {
                log.info("Daily limit reached for action: {}", event.getActionType());
                return;
            }
        }

        long pointsToAward = config.getPoints();
        
        // Handle dynamic payload overrides (e.g. badge rarity)
        if (event.getPayload() != null && event.getPayload() instanceof Long) {
            pointsToAward = (Long) event.getPayload();
        }

        awardPoints(user, profile, pointsToAward, event.getActionType(), event.getSourceModule(), event.getReferenceId());
    }

    private void revokePoints(User user, UserSustainabilityProfile profile, GamificationEvent event) {
        String originalActionType = event.getActionType().replace("_DELETED", "_LOGGED");
        if (originalActionType.equals("ACTIVITY_DELETED")) originalActionType = "FIRST_ACTIVITY_LOGGED"; 
        
        Optional<PointHistory> historyOpt = pointHistoryRepository.findByUserIdAndReferenceIdAndActionType(user.getId(), event.getReferenceId(), "FIRST_ACTIVITY_LOGGED");
        if (historyOpt.isEmpty()) {
            historyOpt = pointHistoryRepository.findByUserIdAndReferenceIdAndActionType(user.getId(), event.getReferenceId(), "DAILY_ACTIVITY_LOGGED");
        }

        if (historyOpt.isPresent()) {
            PointHistory awarded = historyOpt.get();
            if ("AWARDED".equals(awarded.getStatus())) {
                PointHistory revoked = PointHistory.builder()
                        .user(user)
                        .points(-awarded.getPoints())
                        .reason("Revoked: " + awarded.getReason())
                        .actionType(event.getActionType())
                        .sourceModule(event.getSourceModule())
                        .referenceId(event.getReferenceId())
                        .transactionId(java.util.UUID.randomUUID().toString())
                        .status("REVOKED")
                        .build();
                pointHistoryRepository.save(revoked);

                // We update the original status to avoid revoking twice
                awarded.setStatus("REVOKED");
                pointHistoryRepository.save(awarded);

                profile.setTotalPoints(Math.max(0, profile.getTotalPoints() - awarded.getPoints()));
                updateLevel(profile);
                profileRepository.save(profile);

                log.info("Revoked {} points from user {} for reference {}", awarded.getPoints(), user.getId(), event.getReferenceId());
            }
        }
    }

    private void awardPoints(User user, UserSustainabilityProfile profile, Long points, String actionType, String sourceModule, String referenceId) {
        PointHistory history = PointHistory.builder()
                .user(user)
                .points(points)
                .reason(actionType)
                .actionType(actionType)
                .sourceModule(sourceModule)
                .referenceId(referenceId)
                .transactionId(java.util.UUID.randomUUID().toString())
                .status("AWARDED")
                .build();
        pointHistoryRepository.save(history);

        profile.setTotalPoints(profile.getTotalPoints() + points);
        updateLevel(profile);
        profileRepository.save(profile);
        
        log.info("Awarded {} points to user {} for {}", points, user.getId(), actionType);
    }

    @Override
    @Transactional
    public void awardBadgePointsAndXP(User user, com.carbonfootprint.entity.Badge badge) {
        UserSustainabilityProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> createProfile(user));

        long pointsToAward = badge.getPoints() != null ? badge.getPoints() : 0L;
        long xpToAward = badge.getXp() != null ? badge.getXp() : 0L;

        // Add Points
        if (pointsToAward > 0) {
            PointHistory history = PointHistory.builder()
                    .user(user)
                    .points(pointsToAward)
                    .reason("Unlocked Badge: " + badge.getName())
                    .actionType("BADGE_UNLOCKED")
                    .sourceModule("ACHIEVEMENTS")
                    .referenceId("BADGE_" + badge.getId())
                    .transactionId(java.util.UUID.randomUUID().toString())
                    .status("AWARDED")
                    .build();
            pointHistoryRepository.save(history);
            profile.setTotalPoints(profile.getTotalPoints() + pointsToAward);
        }

        // Add XP
        if (xpToAward > 0) {
            profile.setTotalXp(profile.getTotalXp() + xpToAward);
        }

        updateLevel(profile);
        profileRepository.save(profile);

        log.info("Awarded {} points and {} XP to user {} for unlocking badge {}", pointsToAward, xpToAward, user.getId(), badge.getName());
    }

    private void updateStreak(User user, UserSustainabilityProfile profile) {
        LocalDate today = LocalDate.now();
        if (profile.getLastActivityDate() != null) {
            long daysBetween = ChronoUnit.DAYS.between(profile.getLastActivityDate(), today);
            if (daysBetween == 1) {
                profile.setCurrentStreak(profile.getCurrentStreak() + 1);
            } else if (daysBetween > 1) {
                profile.setCurrentStreak(1);
            }
        } else {
            profile.setCurrentStreak(1);
        }
        profile.setLastActivityDate(today);

        if (profile.getCurrentStreak() > profile.getLongestStreak()) {
            profile.setLongestStreak(profile.getCurrentStreak());
        }

        // Fire streak events
        int streak = profile.getCurrentStreak();
        
        // Give a daily bonus for maintaining a streak (starting from day 2)
        if (streak > 1) {
            processDynamicRule(user, profile, new GamificationEvent(this, user.getId(), GamificationEvent.EventType.ACTIVITY_LOGGED, "DAILY_STREAK_BONUS", "SYSTEM", "daily_streak_" + streak + "_" + today, null));
        }

        // Fire generic metrics updated event for Rule Engine
        eventPublisher.publishEvent(new UserMetricsUpdatedEvent(this, user.getId()));
        if (streak == 30) processDynamicRule(user, profile, new GamificationEvent(this, user.getId(), GamificationEvent.EventType.ACTIVITY_LOGGED, "STREAK_30_DAY", "SYSTEM", "streak_30_" + today, null));
        if (streak == 60) processDynamicRule(user, profile, new GamificationEvent(this, user.getId(), GamificationEvent.EventType.ACTIVITY_LOGGED, "STREAK_60_DAY", "SYSTEM", "streak_60_" + today, null));
        if (streak == 90) processDynamicRule(user, profile, new GamificationEvent(this, user.getId(), GamificationEvent.EventType.ACTIVITY_LOGGED, "STREAK_90_DAY", "SYSTEM", "streak_90_" + today, null));
        
        profileRepository.save(profile);
    }

    private UserSustainabilityProfile createProfile(User user) {
        UserSustainabilityProfile newProfile = UserSustainabilityProfile.builder()
                .user(user)
                .totalPoints(0L)
                .totalXp(0L)
                .totalCarbonSaved(java.math.BigDecimal.ZERO)
                .adoptedRecommendationsCount(0)
                .highestStreak(0)
                .currentLevel("Eco Beginner")
                .currentStreak(0)
                .longestStreak(0)
                .build();
        return profileRepository.save(newProfile);
    }

    private void updateLevel(UserSustainabilityProfile profile) {
        long totalXp = profile.getTotalXp();
        // Fallback to totalPoints if XP is not used yet, but going forward we will use totalXP.
        long progressionMetric = totalXp > 0 ? totalXp : profile.getTotalPoints(); 

        java.util.List<com.carbonfootprint.entity.LevelConfig> levels = levelRepository.findAllOrderByMinPointsDesc();
        
        for (com.carbonfootprint.entity.LevelConfig level : levels) {
            if (progressionMetric >= level.getMinPoints()) {
                profile.setCurrentLevel(level.getLevelName());
                return;
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public com.carbonfootprint.dto.UserPointsResponseDto getUserPoints(Long userId) {
        UserSustainabilityProfile profile = profileRepository.findByUserId(userId).orElse(null);
        if (profile == null) {
            return com.carbonfootprint.dto.UserPointsResponseDto.builder()
                .userId(userId)
                .totalPoints(0L)
                .currentLevel("Eco Beginner")
                .currentStreak(0)
                .longestStreak(0)
                .history(java.util.Collections.emptyList())
                .build();
        }
        int activeStreak = profile.getCurrentStreak();
        if (profile.getLastActivityDate() != null) {
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(profile.getLastActivityDate(), java.time.LocalDate.now());
            if (daysBetween > 1) {
                activeStreak = 0; // Streak is broken
            }
        }

        return com.carbonfootprint.dto.UserPointsResponseDto.builder()
            .userId(userId)
            .totalPoints(profile.getTotalPoints())
            .currentLevel(profile.getCurrentLevel())
            .currentStreak(activeStreak)
            .longestStreak(profile.getLongestStreak())
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<com.carbonfootprint.dto.PointHistoryDto> getUserPointHistory(Long userId, org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<com.carbonfootprint.entity.PointHistory> page = pointHistoryRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
        return page.map(history -> com.carbonfootprint.dto.PointHistoryDto.builder()
                .id(history.getId())
                .points(history.getPoints())
                .reason(history.getReason())
                .referenceId(history.getReferenceId())
                .actionType(history.getActionType())
                .sourceModule(history.getSourceModule())
                .status(history.getStatus())
                .timestamp(history.getTimestamp())
                .build());
    }
}
