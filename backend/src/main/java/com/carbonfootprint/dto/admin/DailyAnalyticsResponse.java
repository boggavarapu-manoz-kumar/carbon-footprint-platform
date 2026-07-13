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
public class DailyAnalyticsResponse {

    // ─── Today KPIs ──────────────────────────────────────────────
    private long activitiesToday;
    private BigDecimal emissionsToday;
    private long activeUsersToday;
    private long newUsersToday;
    private long goalsAchievedToday;
    private long badgesEarnedToday;

    // ─── Hourly breakdown (24 slots: 0–23) ───────────────────────
    private List<HourlySlot> hourlyData;

    // ─── Category Distribution ────────────────────────────────────
    private List<CategorySlot> categoryData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlySlot {
        private int hour;           // 0–23
        private String label;       // "12 AM", "1 AM", … "11 PM"
        private long activities;
        private BigDecimal emissions;
        private long activeUsers;
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
