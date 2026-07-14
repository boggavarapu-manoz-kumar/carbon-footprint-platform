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
public class TopActivityDto {
    private Integer rank;
    private String activityName;
    private String categoryName;
    private BigDecimal totalEmissions;
    private BigDecimal emissionPercentage;
    private Long frequency;
}
