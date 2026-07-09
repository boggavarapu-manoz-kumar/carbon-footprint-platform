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
public class TimeSeriesDataPointDto {
    private String label; // "Monday", "Jan", "2024", etc.
    private BigDecimal emissions;
}
