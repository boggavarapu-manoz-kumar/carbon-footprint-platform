package com.carbonfootprint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FootprintAggregationProjectionDTO {
    private LocalDate logDate;
    private String categoryName;
    private BigDecimal totalCarbon;
    private Long totalActivities;
}
