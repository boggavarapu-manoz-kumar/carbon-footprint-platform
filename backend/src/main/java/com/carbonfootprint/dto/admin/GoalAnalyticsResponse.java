package com.carbonfootprint.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalAnalyticsResponse {
    private String category;
    private long totalGoals;
    private long completedGoals;
    private double completionRate;
}
