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
public class MonthlyAnalyticsResponse {

    // ─── Current Month Totals ─────────────────────────────────────
    private long totalActivities;
    private long totalUsers;
    private BigDecimal totalEmissions;
    private long totalGoals;

    // ─── Comparison (Percentage Change vs Prev Month) ─────────────
    private double activitiesChangePct;
    private double usersChangePct;
    private double emissionsChangePct;
    private double goalsChangePct;

    // ─── Weekly breakdown (Week 1 - Week 5) ───────────────────────
    private List<WeeklySlot> weeklyData;

    // ─── Category Distribution ────────────────────────────────────
    private List<CategorySlot> categoryData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklySlot {
        private String weekLabel;   // "Week 1", "Week 2", etc.
        private long activities;
        private long activeUsers;
        private BigDecimal emissions;
        private long goalsAchieved;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySlot {
        private String category;
        private BigDecimal emissions;
    }
}
