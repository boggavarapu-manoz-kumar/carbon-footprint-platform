package com.carbonfootprint.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YearlyAnalyticsResponse {

    // ─── Current Year Totals ─────────────────────────────────────
    private long totalActivities;
    private long totalUsers;
    private BigDecimal totalEmissions;
    private long totalGoals;
    private long totalBadges;
    private long totalOrganizations;

    // ─── Comparison (Percentage Change vs Prev Year) ─────────────
    private double activitiesChangePct;
    private double usersChangePct;
    private double emissionsChangePct;
    private double goalsChangePct;
    private double badgesChangePct;
    private double organizationsChangePct;

    // ─── Monthly breakdown (Jan - Dec) ───────────────────────────
    private List<MonthlySlot> monthlyData;

    // ─── Category Distribution ────────────────────────────────────
    private List<CategorySlot> categoryData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlySlot {
        private String monthLabel;   // "Jan", "Feb", etc.
        private long activities;
        private long activeUsers;
        private BigDecimal emissions;
        private long goalsAchieved;
        private long badgesEarned;
        private long organizationsJoined;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySlot {
        private String category;
        private BigDecimal emissions;
        private long count;
    }
}
