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
public class ActivityAnalyticsResponse {
    private String category;
    private Long totalActivities;
    private BigDecimal totalEmissions;
    private BigDecimal avgEmissions;
}
