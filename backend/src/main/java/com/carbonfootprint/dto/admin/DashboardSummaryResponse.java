package com.carbonfootprint.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryResponse {

    @JsonProperty("total_users")
    private Long totalUsers;

    @JsonProperty("active_users_today")
    private Long activeUsersToday;

    @JsonProperty("total_carbon_offset")
    private BigDecimal totalCarbonOffset;

    @JsonProperty("pending_activities")
    private Long pendingActivities;
}
