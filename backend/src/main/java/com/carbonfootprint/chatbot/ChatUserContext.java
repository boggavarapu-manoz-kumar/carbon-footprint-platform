package com.carbonfootprint.chatbot;

import java.math.BigDecimal;
import java.util.List;

/**
 * Sanitized, minimal context object passed to the AI.
 *
 * SECURITY RULES:
 * - NO database IDs (userId, goalId, badgeId, etc.)
 * - NO email addresses
 * - NO mobile numbers
 * - NO passwords or tokens
 * - NO raw JPA entity references
 * - NO other users' personal data
 * - Organization analytics exposed ONLY for ADMIN/OWNER roles
 */
public class ChatUserContext {

    /** Approved display name only — no email, no userId */
    private String displayName;

    /** Populated when FOOTPRINT scope is active */
    private FootprintContext footprint;

    /** Populated when GOALS scope is active */
    private List<GoalContext> activeGoals;

    /** Populated when GAMIFICATION scope is active */
    private GamificationContext gamification;

    /** Populated when LEADERBOARD scope is active */
    private LeaderboardContext leaderboard;

    /** Populated when RECOMMENDATIONS scope is active — max 3 items */
    private List<String> topRecommendations;

    /** Populated when ORGANIZATION scope is active — role-gated */
    private List<OrganizationContext> organizations;

    // =========================================================
    // Nested sanitized context records
    // =========================================================

    public static class FootprintContext {
        public BigDecimal todayKgCO2;
        public int todayActivities;
        public BigDecimal weekKgCO2;
        public int weekActivities;
        public BigDecimal monthKgCO2;
        public int monthActivities;
        /** Category-level breakdown e.g. {"Transport": 2.4, "Food": 0.8} */
        public java.util.Map<String, BigDecimal> categoryBreakdown;
    }

    public static class GoalContext {
        public String name;
        public String period;
        public String status;          // ACTIVE, COMPLETED, FAILED
        public BigDecimal targetKgCO2;
        public BigDecimal currentKgCO2;
        public BigDecimal progressPercent;
        public String estimatedCompletion;
    }

    public static class GamificationContext {
        public long totalPoints;
        public String currentLevel;
        public int currentStreak;
        public int longestStreak;
        public int unlockedBadgeCount;
        /** Only badge names — no IDs, no image paths */
        public List<String> recentBadgeNames;
    }

    public static class LeaderboardContext {
        public int currentRank;
        public int previousRank;
        public String trend;        // IMPROVED, DROPPED, UNCHANGED
        public long totalScore;
    }

    public static class OrganizationContext {
        public String organizationName;
        public String role;          // ORGANIZATION_OWNER, ORGANIZATION_ADMIN, EMPLOYEE
        public String memberStatus;  // ACTIVE, SUSPENDED
        /** Only visible to ORGANIZATION_ADMIN and ORGANIZATION_OWNER */
        public Long activeMemberCount;
        /** Only visible to ORGANIZATION_ADMIN and ORGANIZATION_OWNER */
        public BigDecimal orgTotalCarbonKg;
    }

    // =========================================================
    // Fluent builder pattern
    // =========================================================

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ChatUserContext ctx = new ChatUserContext();

        public Builder displayName(String v)                   { ctx.displayName = v; return this; }
        public Builder footprint(FootprintContext v)           { ctx.footprint = v; return this; }
        public Builder activeGoals(List<GoalContext> v)        { ctx.activeGoals = v; return this; }
        public Builder gamification(GamificationContext v)     { ctx.gamification = v; return this; }
        public Builder leaderboard(LeaderboardContext v)       { ctx.leaderboard = v; return this; }
        public Builder topRecommendations(List<String> v)      { ctx.topRecommendations = v; return this; }
        public Builder organizations(List<OrganizationContext> v) { ctx.organizations = v; return this; }

        public ChatUserContext build() { return ctx; }
    }

    // Getters
    public String getDisplayName()                   { return displayName; }
    public FootprintContext getFootprint()            { return footprint; }
    public List<GoalContext> getActiveGoals()         { return activeGoals; }
    public GamificationContext getGamification()      { return gamification; }
    public LeaderboardContext getLeaderboard()         { return leaderboard; }
    public List<String> getTopRecommendations()       { return topRecommendations; }
    public List<OrganizationContext> getOrganizations() { return organizations; }
}
