package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.emission.EmissionFactorCreateDto;
import com.carbonfootprint.dto.emission.EmissionFactorDto;
import com.carbonfootprint.dto.emission.EmissionFactorUpdateDto;
import com.carbonfootprint.entity.EmissionFactor;
import com.carbonfootprint.exception.BadRequestException;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.mapper.EmissionFactorMapper;
import com.carbonfootprint.repository.EmissionFactorRepository;
import com.carbonfootprint.service.EmissionFactorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmissionFactorServiceImpl implements EmissionFactorService {

    private final EmissionFactorRepository repository;
    private final EmissionFactorMapper mapper;

    @Override
    @Transactional
    public EmissionFactorDto createEmissionFactor(final EmissionFactorCreateDto createDto) {
        log.info("Creating emission factor for: {}", createDto.getActivityType());
        
        if (repository.existsByActivityTypeIgnoreCase(createDto.getActivityType())) {
            throw new BadRequestException("Emission factor for activity type already exists: " + createDto.getActivityType());
        }
        
        EmissionFactor entity = mapper.toEntity(createDto);
        return mapper.toDto(repository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public EmissionFactorDto getEmissionFactorById(final Long id) {
        EmissionFactor entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmissionFactor not found"));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public EmissionFactorDto getEmissionFactorByType(final String activityType) {
        EmissionFactor entity = repository.findByActivityTypeIgnoreCase(activityType)
                .orElseThrow(() -> new ResourceNotFoundException("EmissionFactor not found"));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmissionFactorDto> getAllEmissionFactors(final Pageable pageable) {
        return repository.findAll(pageable).map(mapper::toDto);
    }

    @Override
    @Transactional
    public EmissionFactorDto updateEmissionFactor(final Long id, final EmissionFactorUpdateDto updateDto) {
        log.info("Updating emission factor ID: {}", id);
        
        EmissionFactor entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmissionFactor not found"));

        boolean updated = false;
        if (updateDto.getActivityType() != null && !updateDto.getActivityType().trim().isEmpty()) {
            if (!entity.getActivityType().equalsIgnoreCase(updateDto.getActivityType()) &&
                repository.existsByActivityTypeIgnoreCase(updateDto.getActivityType())) {
                throw new BadRequestException("Emission factor for activity type already exists: " + updateDto.getActivityType());
            }
            entity.setActivityType(updateDto.getActivityType().trim());
            updated = true;
        }
        
        if (updateDto.getFactorValue() != null) {
            entity.setFactorValue(updateDto.getFactorValue());
            updated = true;
        }
        
        if (updateDto.getUnit() != null && !updateDto.getUnit().trim().isEmpty()) {
            entity.setUnit(updateDto.getUnit().trim());
            updated = true;
        }
        
        if (updateDto.getSource() != null && !updateDto.getSource().trim().isEmpty()) {
            entity.setSource(updateDto.getSource().trim());
            updated = true;
        }
        
        if (updated) {
            entity = repository.save(entity);
        }
        
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void deleteEmissionFactor(final Long id) {
        log.info("Deleting emission factor ID: {}", id);
        EmissionFactor entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmissionFactor not found"));
        repository.delete(entity);
    }
}
