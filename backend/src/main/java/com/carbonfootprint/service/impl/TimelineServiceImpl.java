package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.TimelineEventDto;
import com.carbonfootprint.entity.ActivityLog;
import com.carbonfootprint.entity.Goal;
import com.carbonfootprint.entity.GoalStatus;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.entity.UserBadge;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.GoalRepository;
import com.carbonfootprint.repository.UserBadgeRepository;
import com.carbonfootprint.service.TimelineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimelineServiceImpl implements TimelineService {

    private final ActivityLogRepository activityLogRepository;
    private final GoalRepository goalRepository;
    private final UserBadgeRepository userBadgeRepository;

    @Override
    public List<TimelineEventDto> getUserTimeline(User user) {
        List<TimelineEventDto> timeline = new ArrayList<>();

        // 1. Account Created
        timeline.add(TimelineEventDto.builder()
                .id("ACCOUNT_CREATED")
                .title("Account Created")
                .description("Joined Carbon Footprint Platform")
                .timestamp(user.getCreatedAt())
                .type("ACCOUNT")
                .iconName("person_add")
                .color("text-blue-500")
                .build());

        // 2. First Activity
        Optional<ActivityLog> firstActivity = activityLogRepository.findFirstByUserIdOrderByLogDateAsc(user.getId());
        firstActivity.ifPresent(activity -> {
            timeline.add(TimelineEventDto.builder()
                    .id("FIRST_ACTIVITY")
                    .title("First Activity Logged")
                    .description("Logged first carbon activity: " + activity.getActivityType().getName())
                    .timestamp(activity.getLogDate().atStartOfDay())
                    .type("ACTIVITY")
                    .iconName("leaf")
                    .color("text-green-500")
                    .build());
        });

        // 3. First Goal Completed
        Optional<Goal> firstGoal = goalRepository.findFirstByUserIdAndStatusOrderByCreatedAtAsc(user.getId(), GoalStatus.ACHIEVED);
        firstGoal.ifPresent(goal -> {
            timeline.add(TimelineEventDto.builder()
                    .id("FIRST_GOAL")
                    .title("First Goal Achieved")
                    .description("Successfully completed goal: " + goal.getName())
                    .timestamp(goal.getUpdatedAt())
                    .type("GOAL")
                    .iconName("flag")
                    .color("text-purple-500")
                    .build());
        });

        // 4. Badges (Streaks, Reduction, 100 Activities, etc)
        List<UserBadge> badges = userBadgeRepository.findByUserId(user.getId());
        for (UserBadge badge : badges) {
            timeline.add(TimelineEventDto.builder()
                    .id("BADGE_" + badge.getId())
                    .title("Earned " + badge.getBadge().getName())
                    .description(badge.getBadge().getDescription())
                    .timestamp(badge.getAwardedAt())
                    .type("BADGE")
                    .iconName(badge.getBadge().getIcon() != null ? badge.getBadge().getIcon() : "emoji_events")
                    .color(getBadgeColor(badge.getBadge().getDifficulty()))
                    .build());
        }

        // Sort timeline by timestamp descending
        timeline.sort(Comparator.comparing(TimelineEventDto::getTimestamp).reversed());

        return timeline;
    }

    private String getBadgeColor(String difficulty) {
        if (difficulty == null) return "text-emerald-500";
        return switch (difficulty) {
            case "RARE" -> "text-indigo-500";
            case "LEGENDARY" -> "text-amber-500";
            case "HARD" -> "text-rose-500";
            case "MEDIUM" -> "text-orange-500";
            default -> "text-emerald-500";
        };
    }
}
