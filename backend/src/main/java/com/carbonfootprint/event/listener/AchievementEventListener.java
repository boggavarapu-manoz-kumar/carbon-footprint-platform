package com.carbonfootprint.event.listener;

import com.carbonfootprint.entity.Badge;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.entity.UserBadge;
import com.carbonfootprint.event.AchievementUnlockedEvent;
import com.carbonfootprint.repository.BadgeRepository;
import com.carbonfootprint.repository.UserBadgeRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.EmailService;
import com.carbonfootprint.service.NotificationService;
import com.carbonfootprint.service.GamificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class AchievementEventListener {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final GamificationService gamificationService;
    private final ObjectMapper objectMapper;

    @Async
    @EventListener
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void handleAchievementUnlocked(AchievementUnlockedEvent event) {
        log.info("Processing AchievementUnlockedEvent for user: {}, badge: {}", event.getUserId(), event.getBadgeName());

        Optional<User> userOpt = userRepository.findById(event.getUserId());
        if (userOpt.isEmpty()) {
            log.warn("User not found for achievement event: {}", event.getUserId());
            return;
        }
        User user = userOpt.get();

        // 1. Get or create the Badge definition
        Badge badge = badgeRepository.findByName(event.getBadgeName())
                .orElseGet(() -> badgeRepository.save(Badge.builder()
                        .name(event.getBadgeName())
                        .description(event.getBadgeDescription())
                        .criteria(event.getBadgeCriteria())
                        .difficulty("COMMON") // Default fallback
                        .build()));

        // Ensure XP, Points, and Level are populated based on Rarity if missing
        boolean needsSave = false;
        if (badge.getPoints() == null || badge.getXp() == null || badge.getLevel() == null) {
            String diff = badge.getDifficulty() != null ? badge.getDifficulty().toUpperCase() : "COMMON";
            switch (diff) {
                case "LEGENDARY":
                    if (badge.getPoints() == null) badge.setPoints(250L);
                    if (badge.getXp() == null) badge.setXp(2500L);
                    if (badge.getLevel() == null) badge.setLevel(4);
                    break;
                case "EPIC":
                case "HARD":
                    if (badge.getPoints() == null) badge.setPoints(100L);
                    if (badge.getXp() == null) badge.setXp(1000L);
                    if (badge.getLevel() == null) badge.setLevel(3);
                    break;
                case "RARE":
                case "MEDIUM":
                    if (badge.getPoints() == null) badge.setPoints(50L);
                    if (badge.getXp() == null) badge.setXp(500L);
                    if (badge.getLevel() == null) badge.setLevel(2);
                    break;
                case "COMMON":
                case "EASY":
                default:
                    if (badge.getPoints() == null) badge.setPoints(10L);
                    if (badge.getXp() == null) badge.setXp(100L);
                    if (badge.getLevel() == null) badge.setLevel(1);
                    break;
            }
            badge = badgeRepository.save(badge);
        }

        // 2. Check if the user already has this badge (to prevent duplicates)
        boolean alreadyAwarded = userBadgeRepository.existsByUserAndBadge(user, badge);
        if (alreadyAwarded) {
            log.info("User {} already has badge {}", user.getId(), badge.getName());
            return;
        }

        // 3. Award the badge
        UserBadge userBadge = UserBadge.builder()
                .user(user)
                .badge(badge)
                .build();
        userBadgeRepository.save(userBadge);
        log.info("Successfully awarded badge {} to user {}", badge.getName(), user.getId());

        // 4. Award XP and Points!
        gamificationService.awardBadgePointsAndXP(user, badge);

        // 5. Send in-app notification with JSON metadata
        String metaData = "{}";
        try {
            Map<String, Object> metaDataMap = new HashMap<>();
            metaDataMap.put("badgeId", badge.getId());
            metaDataMap.put("badgeName", badge.getName());
            metaDataMap.put("points", badge.getPoints());
            metaDataMap.put("criteria", badge.getCriteria());
            metaDataMap.put("imageUrl", badge.getImageUrl());
            metaDataMap.put("icon", badge.getIcon());
            metaDataMap.put("category", badge.getCategory());
            metaDataMap.put("difficulty", badge.getDifficulty());
            metaDataMap.put("nextBadgeSuggestion", "Keep logging activities to unlock the next level!");
            metaData = objectMapper.writeValueAsString(metaDataMap);
        } catch (Exception e) {
            log.error("Failed to serialize badge metadata", e);
        }

        notificationService.createAchievementNotification(
                user,
                "Achievement Unlocked! 🏆",
                "You've earned the '" + badge.getName() + "' badge: " + badge.getDescription(),
                metaData
        );

        // 5. Send celebratory email
        Map<String, Object> emailData = new HashMap<>();
        emailData.put("userName", user.getFirstName());
        emailData.put("badgeName", badge.getName());
        emailData.put("badgeDescription", badge.getDescription());
        emailData.put("badgeCriteria", badge.getCriteria());
        emailData.put("badgePoints", badge.getPoints());
        emailData.put("badgeImage", badge.getImageUrl() != null ? badge.getImageUrl() : "https://ui-avatars.com/api/?name=" + badge.getName().replace(" ", "+"));
        emailData.put("nextBadgeSuggestion", "Keep logging activities to unlock the next level!");
        
        emailService.sendAchievementEmail(user.getEmail(), "🏆 You unlocked a new achievement: " + badge.getName(), emailData);
    }
}
