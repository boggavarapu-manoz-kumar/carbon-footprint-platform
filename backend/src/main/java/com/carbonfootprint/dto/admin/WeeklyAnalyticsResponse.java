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
public class WeeklyAnalyticsResponse {

    // ─── Current Week Totals ──────────────────────────────────────
    private long totalActivities;
    private long totalUsers;
    private BigDecimal totalEmissions;
    private long totalGoals;

    // ─── Comparison (Percentage Change vs Prev Week) ──────────────
    private double activitiesChangePct;
    private double usersChangePct;
    private double emissionsChangePct;
    private double goalsChangePct;

    // ─── Daily breakdown (Mon - Sun) ──────────────────────────────
    private List<DailySlot> weeklyData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySlot {
        private String dayOfWeek;   // "Monday", "Tuesday", etc.
        private String dateLabel;   // "Jul 05"
        private long activities;
        private long activeUsers;
        private BigDecimal emissions;
        private long goalsAchieved;
    }
}
