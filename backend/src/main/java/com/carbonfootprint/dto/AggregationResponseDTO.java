package com.carbonfootprint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AggregationResponseDTO {
    private String period; // DAILY, WEEKLY, MONTHLY
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal overallTotalCarbon;
    private Long overallTotalActivities;
    private List<FootprintAggregationProjectionDTO> dailyBreakdown;
}
