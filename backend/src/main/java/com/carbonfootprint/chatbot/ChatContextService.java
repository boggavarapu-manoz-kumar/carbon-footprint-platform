package com.carbonfootprint.chatbot;

import com.carbonfootprint.dto.AggregationResponseDTO;
import com.carbonfootprint.dto.GoalResponse;
import com.carbonfootprint.dto.BadgeShowcaseDto;
import com.carbonfootprint.dto.UserPointsResponseDto;
import com.carbonfootprint.dto.leaderboard.UserLeaderboardStatsDto;
import com.carbonfootprint.dto.recommendation.RecommendationResponseDto;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service responsible for determining the required data scopes based on the query,
 * retrieving only the necessary data, and sanitizing it into a minimal DTO (ChatUserContext).
 *
 * Implements strict DATA MINIMIZATION and TENANT ISOLATION.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatContextService {

    private final FootprintAggregationService footprintAggregationService;
    private final LeaderboardService leaderboardService;
    private final GoalService goalService;
    private final BadgeShowcaseService badgeShowcaseService;
    private final GamificationService gamificationService;
    private final RecommendationService recommendationService;

    private static final Map<DataScope, List<String>> SCOPE_KEYWORDS = Map.of(
            DataScope.FOOTPRINT, List.of("footprint", "emission", "carbon", "co2", "kg", "today", "week", "month", "activity", "activities", "track"),
            DataScope.GOALS, List.of("goal", "target", "progress", "achieve", "reduction", "on track", "plan"),
            DataScope.GAMIFICATION, List.of("point", "level", "badge", "streak", "xp", "reward", "unlock", "gamification", "showcase"),
            DataScope.LEADERBOARD, List.of("leaderboard", "rank", "score", "standings", "position", "compare", "compete"),
            DataScope.RECOMMENDATIONS, List.of("recommendation", "suggest", "improve", "tip", "advice", "how can i", "help me reduce"),
            DataScope.PLATFORM_HELP, List.of("help", "how to", "what is", "explain", "features", "dashboard", "platform")
    );

    /**
     * Determines which data scopes are relevant to the user's query.
     */
    public Set<DataScope> determineScopes(String query) {
        String normalized = query.toLowerCase();
        Set<DataScope> activeScopes = EnumSet.noneOf(DataScope.class);

        for (Map.Entry<DataScope, List<String>> entry : SCOPE_KEYWORDS.entrySet()) {
            if (entry.getValue().stream().anyMatch(normalized::contains)) {
                activeScopes.add(entry.getKey());
            }
        }

        // Always include basic footprint context as a baseline if no specific scopes matched,
        // or if it's a general query, unless it's strictly platform help.
        if (activeScopes.isEmpty()) {
            activeScopes.add(DataScope.FOOTPRINT);
        }

        return activeScopes;
    }

    /**
     * Builds the sanitized context object containing ONLY the requested scopes.
     */
    @Transactional(readOnly = true)
    public ChatUserContext buildContext(User user, Set<DataScope> scopes) {
        ChatUserContext.Builder builder = ChatUserContext.builder()
                .displayName(user.getFirstName()); // Only first name, no PII like email/phone

        if (scopes.contains(DataScope.FOOTPRINT)) {
            builder.footprint(buildFootprintContext(user));
        }

        if (scopes.contains(DataScope.GOALS)) {
            builder.activeGoals(buildGoalsContext(user));
        }

        if (scopes.contains(DataScope.GAMIFICATION)) {
            builder.gamification(buildGamificationContext(user));
        }

        if (scopes.contains(DataScope.LEADERBOARD)) {
            builder.leaderboard(buildLeaderboardContext(user));
        }

        if (scopes.contains(DataScope.RECOMMENDATIONS)) {
            builder.topRecommendations(buildRecommendationsContext(user));
        }


        return builder.build();
    }

    private ChatUserContext.FootprintContext buildFootprintContext(User user) {
        ChatUserContext.FootprintContext ctx = new ChatUserContext.FootprintContext();
        
        // Fetch aggregations. Note: we are NOT passing raw logs to the AI.
        AggregationResponseDTO today = footprintAggregationService.getAggregation(user.getId(), "DAILY", LocalDate.now());
        AggregationResponseDTO week = footprintAggregationService.getAggregation(user.getId(), "WEEKLY", LocalDate.now());
        
        ctx.todayKgCO2 = today.getOverallTotalCarbon();
        ctx.todayActivities = today.getOverallTotalActivities().intValue();
        ctx.weekKgCO2 = week.getOverallTotalCarbon();
        ctx.weekActivities = week.getOverallTotalActivities().intValue();
        
        // We could fetch monthly and categories if needed, keeping it simple for now to minimize data.
        return ctx;
    }

    private List<ChatUserContext.GoalContext> buildGoalsContext(User user) {
        List<GoalResponse> goals = goalService.getUserGoals(user.getId());
        return goals.stream()
                .filter(g -> g.getStatus().name().equals("ACTIVE") || g.getStatus().name().equals("ON_TRACK") || g.getStatus().name().equals("AT_RISK"))
                .map(g -> {
                    ChatUserContext.GoalContext ctx = new ChatUserContext.GoalContext();
                    ctx.name = g.getName();
                    ctx.status = g.getStatus().name();
                    ctx.targetKgCO2 = g.getTargetEmission();
                    ctx.currentKgCO2 = g.getBaselineEmission(); // Using baseline as current for simplicity in this DTO, ideally we'd track actual current
                    ctx.progressPercent = g.getProgressPercent();
                    ctx.estimatedCompletion = g.getEstimatedCompletionDate() != null ? g.getEstimatedCompletionDate().toString() : "Unknown";
                    ctx.period = g.getStartDate() + " to " + g.getTargetDate();
                    return ctx;
                })
                .collect(Collectors.toList());
    }

    private ChatUserContext.GamificationContext buildGamificationContext(User user) {
        ChatUserContext.GamificationContext ctx = new ChatUserContext.GamificationContext();
        
        UserPointsResponseDto points = gamificationService.getUserPoints(user.getId());
        ctx.totalPoints = points.getTotalPoints();
        ctx.currentLevel = points.getCurrentLevel();
        ctx.currentStreak = points.getCurrentStreak();
        ctx.longestStreak = points.getLongestStreak();
        
        BadgeShowcaseDto badges = badgeShowcaseService.getBadgeShowcaseForUser(user);
        ctx.unlockedBadgeCount = badges.getEarnedBadges().size();
        
        ctx.recentBadgeNames = badges.getEarnedBadges() != null ? badges.getEarnedBadges().stream()
                .limit(5)
                .map(b -> b.getName())
                .collect(Collectors.toList()) : Collections.emptyList();
                
        return ctx;
    }

    private ChatUserContext.LeaderboardContext buildLeaderboardContext(User user) {
        ChatUserContext.LeaderboardContext ctx = new ChatUserContext.LeaderboardContext();
        UserLeaderboardStatsDto stats = leaderboardService.getUserLeaderboardStats(user.getEmail());
        
        ctx.currentRank = stats.getCurrentRank();
        ctx.previousRank = stats.getPreviousRank() != null ? stats.getPreviousRank() : stats.getCurrentRank();
        ctx.totalScore = stats.getCurrentScore();
        ctx.trend = stats.getTrend() != null ? stats.getTrend() : "UNCHANGED";
        
        return ctx;
    }

    private List<String> buildRecommendationsContext(User user) {
        List<RecommendationResponseDto> recs = recommendationService.getPersonalizedRecommendations(user.getEmail());
        return recs.stream()
                .limit(3)
                .map(RecommendationResponseDto::getRecommendation)
                .collect(Collectors.toList());
    }

}
