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
public class CatalogActivityTypeDto {
    private String code;
    private String name;
    private String calculationStrategy;
    private List<CatalogSchemaDto> schema;
}
