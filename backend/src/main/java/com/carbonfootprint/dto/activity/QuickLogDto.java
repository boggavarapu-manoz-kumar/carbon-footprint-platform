package com.carbonfootprint.dto.activity;

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
public class QuickLogDto {
    private Long id; // ID of pinned activity if pinned, or just unique identifier
    private Long activityTypeId;
    private String categoryCode;
    private String activityTypeCode;
    private String dynamicInputs;
    private String icon;
    private String name;
    private String category;
    private LocalDate lastUsedDate;
    private Long usageCount;
    private String preferredUnit;
    private boolean isPinned;
    private BigDecimal suggestedQuantity;
    private Double score; // For internal sorting (smart suggestions)
}
