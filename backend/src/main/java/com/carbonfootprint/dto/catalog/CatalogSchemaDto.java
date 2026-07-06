package com.carbonfootprint.dto.catalog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CatalogSchemaDto {
    private String fieldName;
    private String fieldType;
    private String unit;
    private Boolean isRequired;
    private String validationRules;
}
