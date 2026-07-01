package com.carbonfootprint.controller;

import com.carbonfootprint.dto.emission.EmissionFactorCreateDto;
import com.carbonfootprint.dto.emission.EmissionFactorDto;
import com.carbonfootprint.dto.emission.EmissionFactorUpdateDto;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.EmissionFactorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/emission-factors")
@RequiredArgsConstructor
public class EmissionFactorController {

    private final EmissionFactorService service;

    // Only Admins should create global emission factors
    @PostMapping
    @PreAuthorize("hasRole(ADMIN)")
    public ResponseEntity<ApiResponse<EmissionFactorDto>> createEmissionFactor(
            @Valid @RequestBody EmissionFactorCreateDto createDto) {
        log.info("REST request to create EmissionFactor");
        EmissionFactorDto dto = service.createEmissionFactor(createDto);
        return new ResponseEntity<>(ApiResponse.success(dto, "Emission factor created successfully"), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EmissionFactorDto>>> getAllEmissionFactors(
            @PageableDefault(sort = "activityType") Pageable pageable) {
        log.info("REST request to get all EmissionFactors");
        Page<EmissionFactorDto> factors = service.getAllEmissionFactors(pageable);
        return ResponseEntity.ok(ApiResponse.success(factors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmissionFactorDto>> getEmissionFactorById(@PathVariable Long id) {
        EmissionFactorDto dto = service.getEmissionFactorById(id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/type/{activityType}")
    public ResponseEntity<ApiResponse<EmissionFactorDto>> getEmissionFactorByType(@PathVariable String activityType) {
        EmissionFactorDto dto = service.getEmissionFactorByType(activityType);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    // Only Admins should update global emission factors
    @PutMapping("/{id}")
    @PreAuthorize("hasRole(ADMIN)")
    public ResponseEntity<ApiResponse<EmissionFactorDto>> updateEmissionFactor(
            @PathVariable Long id,
            @Valid @RequestBody EmissionFactorUpdateDto updateDto) {
        log.info("REST request to update EmissionFactor: {}", id);
        EmissionFactorDto dto = service.updateEmissionFactor(id, updateDto);
        return ResponseEntity.ok(ApiResponse.success(dto, "Emission factor updated successfully"));
    }

    // Only Admins should delete global emission factors
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole(ADMIN)")
    public ResponseEntity<ApiResponse<Void>> deleteEmissionFactor(@PathVariable Long id) {
        log.info("REST request to delete EmissionFactor: {}", id);
        service.deleteEmissionFactor(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Emission factor deleted successfully"));
    }
}
