package com.carbonfootprint.response.support;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminFeedbackStatsResponse {
    private Double averageRating;
    private Double customerSatisfactionScore; // percentage of 4-5 stars
    private Long totalFeedback;
    private Long excellentCount;
    private Long goodCount;
    private Long averageCount;
    private Long poorCount;
    private Long terribleCount;
}
