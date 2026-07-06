package com.carbonfootprint.controller;

import com.carbonfootprint.dto.catalog.CatalogCategoryDto;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.ActivityCatalogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/catalog")
@RequiredArgsConstructor
public class ActivityCatalogController {

    private final ActivityCatalogService catalogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CatalogCategoryDto>>> getFullCatalog() {
        log.info("Fetching full activity catalog");
        List<CatalogCategoryDto> catalog = catalogService.getFullCatalog();
        return ResponseEntity.ok(ApiResponse.success(catalog));
    }
}
