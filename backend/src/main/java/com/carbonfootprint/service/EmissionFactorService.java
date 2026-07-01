package com.carbonfootprint.service;

import com.carbonfootprint.dto.emission.EmissionFactorCreateDto;
import com.carbonfootprint.dto.emission.EmissionFactorDto;
import com.carbonfootprint.dto.emission.EmissionFactorUpdateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmissionFactorService {
    EmissionFactorDto createEmissionFactor(EmissionFactorCreateDto createDto);
    EmissionFactorDto getEmissionFactorById(Long id);
    EmissionFactorDto getEmissionFactorByType(String activityType);
    Page<EmissionFactorDto> getAllEmissionFactors(Pageable pageable);
    EmissionFactorDto updateEmissionFactor(Long id, EmissionFactorUpdateDto updateDto);
    void deleteEmissionFactor(Long id);
}
