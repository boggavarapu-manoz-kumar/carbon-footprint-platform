package com.carbonfootprint.dto.activity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalculationResponseDto {
    private BigDecimal emission;
    private BigDecimal factorUsed;
    private String breakdown;
}
