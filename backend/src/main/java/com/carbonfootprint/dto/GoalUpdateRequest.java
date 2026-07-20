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
public class GoalUpdateRequest {
    private String name;
    private String description;
    private LocalDate targetDate;
    private BigDecimal targetEmission;
    private BigDecimal targetReductionPercent;
}
