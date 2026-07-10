package com.carbonfootprint.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformAnalyticsResponse {
    private long totalUsers;
    private long activeUsers;
    private long totalActivities;
    private BigDecimal totalEmissions;
    private long totalGoals;
    private long completedGoals;
}
