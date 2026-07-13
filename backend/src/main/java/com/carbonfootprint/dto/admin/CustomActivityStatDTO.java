package com.carbonfootprint.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomActivityStatDTO {
    private String name;
    private Long usageCount;
    private BigDecimal totalEmissions;
}
