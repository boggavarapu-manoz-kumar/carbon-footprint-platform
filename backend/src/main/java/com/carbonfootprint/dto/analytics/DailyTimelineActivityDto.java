package com.carbonfootprint.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyTimelineActivityDto {
    private Long id;
    private String activityName;
    private String categoryName;
    private BigDecimal emissionValue;
    private String formattedTime; // e.g., "03:40 PM"
    private Long timestamp; // Exact unix timestamp for continuous X-axis plotting
}
