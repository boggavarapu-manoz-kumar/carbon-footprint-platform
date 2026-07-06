package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.catalog.*;
import com.carbonfootprint.entity.ActivityCategory;
import com.carbonfootprint.repository.ActivityCategoryRepository;
import com.carbonfootprint.service.ActivityCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityCatalogServiceImpl implements ActivityCatalogService {

    private final ActivityCategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CatalogCategoryDto> getFullCatalog() {
        List<ActivityCategory> categories = categoryRepository.findAll();
        
        return categories.stream().map(cat -> CatalogCategoryDto.builder()
                .code(cat.getCode())
                .name(cat.getName())
                .icon(cat.getIcon())
                .subCategories(cat.getSubCategories() == null ? List.of() : cat.getSubCategories().stream().map(sub -> CatalogSubCategoryDto.builder()
                        .code(sub.getCode())
                        .name(sub.getName())
                        .activityTypes(sub.getActivityTypes() == null ? List.of() : sub.getActivityTypes().stream().map(type -> CatalogActivityTypeDto.builder()
                                .code(type.getCode())
                                .name(type.getName())
                                .calculationStrategy(type.getCalculationStrategy())
                                .schema(type.getInputSchemas() == null ? List.of() : type.getInputSchemas().stream().map(schema -> CatalogSchemaDto.builder()
                                        .fieldName(schema.getFieldName())
                                        .fieldType(schema.getFieldType())
                                        .unit(schema.getUnit())
                                        .isRequired(schema.getIsRequired())
                                        .validationRules(schema.getValidationRules())
                                        .build()).collect(Collectors.toList()))
                                .build()).collect(Collectors.toList()))
                        .build()).collect(Collectors.toList()))
                .build()).collect(Collectors.toList());
    }
}
