package com.carbonfootprint.dto.catalog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CatalogSubCategoryDto {
    private String code;
    private String name;
    private List<CatalogActivityTypeDto> activityTypes;
}
