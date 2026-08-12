package com.carbonfootprint.dto.organization.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSeriesPointDto {
    private String date; // E.g., "YYYY-MM-DD" or "YYYY-MM"
    private Double totalEmissions;
}
