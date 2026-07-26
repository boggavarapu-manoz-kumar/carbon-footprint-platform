package com.carbonfootprint.dto.admin.benchmarking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminBenchmarkingSummaryDto {
    private BigDecimal platformAverageCarbon;
    private BigDecimal platformMedianCarbon;
    private String highestCategory;
    private String lowestCategory;
    private List<AdminBenchmarkingCategoryDto> categoryAverages;
    private Long totalActiveUsers;
}
