package com.carbonfootprint.dto.admin.benchmarking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminBenchmarkingCategoryDto {
    private String category;
    private BigDecimal averageEmissions;
    private Long totalUsersReporting;
}
