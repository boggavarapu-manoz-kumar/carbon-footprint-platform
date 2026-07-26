package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.BadgeDetailDto;
import com.carbonfootprint.dto.BadgeShowcaseDto;
import com.carbonfootprint.entity.*;
import com.carbonfootprint.repository.*;
import com.carbonfootprint.service.BadgeShowcaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BadgeShowcaseServiceImpl implements BadgeShowcaseService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ActivityLogRepository activityRepository;
    private final GoalRepository goalRepository;
    private final UserSustainabilityProfileRepository profileRepository;

    @Override
    public BadgeShowcaseDto getBadgeShowcaseForUser(User user) {
        List<Badge> allActiveBadges = badgeRepository.findByStatus(BadgeStatus.ACTIVE);
        
        List<UserBadge> earnedBadges = userBadgeRepository.findByUserId(user.getId());
        Map<Long, UserBadge> earnedBadgeMap = earnedBadges.stream()
                .collect(Collectors.toMap(ub -> ub.getBadge().getId(), ub -> ub));
                
        // Calculate user metrics once
        UserSustainabilityProfile profile = profileRepository.findByUserId(user.getId()).orElse(new UserSustainabilityProfile());
        long activityCount = activityRepository.countByUserId(user.getId());
        long goalCount = goalRepository.findByUserIdAndStatus(user.getId(), GoalStatus.ACHIEVED).size();
        
        List<BadgeDetailDto> earned = new ArrayList<>();
        List<BadgeDetailDto> locked = new ArrayList<>();
        List<BadgeDetailDto> upcoming = new ArrayList<>();
        List<BadgeDetailDto> rare = new ArrayList<>();
        List<BadgeDetailDto> legendary = new ArrayList<>();
        
        for (Badge badge : allActiveBadges) {
            BadgeDetailDto dto = mapToDto(badge);
            
            if (earnedBadgeMap.containsKey(badge.getId())) {
                UserBadge ub = earnedBadgeMap.get(badge.getId());
                dto.setEarned(true);
                dto.setEarnedAt(ub.getAwardedAt());
                dto.setCurrentProgress(badge.getRuleTarget() != null ? badge.getRuleTarget() : 1);
                dto.setTargetProgress(badge.getRuleTarget() != null ? badge.getRuleTarget() : 1);
                
                earned.add(dto);
                
                // Also add to rare/legendary if applicable
                categorizeRarity(dto, rare, legendary);
            } else {
                dto.setEarned(false);
                calculateProgress(dto, badge, profile, activityCount, goalCount);
                
                if (dto.getTargetProgress() > 0 && dto.getCurrentProgress() >= dto.getTargetProgress()) {
                    // Auto-award badge that they deserve but missed the event trigger for!
                    dto.setEarned(true);
                    dto.setEarnedAt(java.time.LocalDateTime.now());
                    
                    UserBadge newBadge = new UserBadge();
                    newBadge.setUser(user);
                    newBadge.setBadge(badge);
                    newBadge.setAwardedAt(java.time.LocalDateTime.now());
                    userBadgeRepository.save(newBadge);
                    
                    earned.add(dto);
                    categorizeRarity(dto, rare, legendary);
                } else {
                    locked.add(dto);
                }
                
                // Check if upcoming (> 50% progress)
                if (dto.getTargetProgress() != null && dto.getTargetProgress() > 0) {
                    double progressPercentage = (double) dto.getCurrentProgress() / dto.getTargetProgress();
                    if (progressPercentage >= 0.5 && progressPercentage < 1.0) {
                        upcoming.add(dto);
                    }
                }
                
                // Also add to rare/legendary if applicable
                categorizeRarity(dto, rare, legendary);
            }
        }
        
        return BadgeShowcaseDto.builder()
                .earnedBadges(earned)
                .lockedBadges(locked)
                .upcomingBadges(upcoming)
                .rareBadges(rare)
                .legendaryBadges(legendary)
                .build();
    }
    
    private void categorizeRarity(BadgeDetailDto dto, List<BadgeDetailDto> rare, List<BadgeDetailDto> legendary) {
        if ("LEGENDARY".equalsIgnoreCase(dto.getDifficulty())) {
            legendary.add(dto);
        } else if ("RARE".equalsIgnoreCase(dto.getDifficulty())) {
            rare.add(dto);
        }
    }
    
    private void calculateProgress(BadgeDetailDto dto, Badge badge, UserSustainabilityProfile profile, long activityCount, long goalCount) {
        dto.setRuleType(badge.getRuleType() != null ? badge.getRuleType().name() : null);
        dto.setTargetProgress(badge.getRuleTarget() != null ? badge.getRuleTarget() : 0);
        
        if (badge.getRuleType() == null || badge.getRuleTarget() == null || badge.getRuleTarget() == 0) {
            dto.setCurrentProgress(0);
            return;
        }
        
        int progress = 0;
        switch (badge.getRuleType()) {
            case STREAK:
                progress = profile.getCurrentStreak() != null ? profile.getCurrentStreak() : 0;
                break;
            case ACTIVITY_COUNT:
                progress = (int) activityCount;
                break;
            case GOAL_COMPLETED:
                progress = (int) goalCount;
                break;
            case CARBON_REDUCED:
                progress = profile.getTotalCarbonSaved() != null ? profile.getTotalCarbonSaved().intValue() : 0;
                break;
            case RECOMMENDATION_FOLLOWED:
            case LEADERBOARD_RANK:
            default:
                progress = 0;
                break;
        }
        
        // Cap progress at target
        if (progress > badge.getRuleTarget()) {
            progress = badge.getRuleTarget();
        }
        dto.setCurrentProgress(progress);
    }
    
    private BadgeDetailDto mapToDto(Badge badge) {
        return BadgeDetailDto.builder()
                .id(badge.getId())
                .name(badge.getName())
                .description(badge.getDescription())
                .category(badge.getCategory())
                .points(badge.getPoints() != null ? badge.getPoints().intValue() : 0)
                .difficulty(badge.getDifficulty())
                .iconName(badge.getIcon() != null ? badge.getIcon() : "emoji_events")
                .criteria(badge.getCriteria())
                .imagePath(badge.getImageUrl()) // if uploaded image exists
                .build();
    }
}
