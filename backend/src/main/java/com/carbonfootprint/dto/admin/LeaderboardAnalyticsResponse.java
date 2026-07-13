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
public class LeaderboardAnalyticsResponse {
    private String username;
    private String firstName;
    private String lastName;
    private BigDecimal totalEmissions;
    private long totalActivities;
}
