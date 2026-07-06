package com.carbonfootprint.service;

import com.carbonfootprint.dto.catalog.CatalogCategoryDto;

import java.util.List;

public interface ActivityCatalogService {
    List<CatalogCategoryDto> getFullCatalog();
}
