package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.emission.EmissionFactorCreateDto;
import com.carbonfootprint.dto.emission.EmissionFactorDto;
import com.carbonfootprint.dto.emission.EmissionFactorUpdateDto;
import com.carbonfootprint.entity.ActivityType;
import com.carbonfootprint.entity.EmissionFactor;
import com.carbonfootprint.exception.BadRequestException;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.mapper.EmissionFactorMapper;
import com.carbonfootprint.repository.ActivityTypeRepository;
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
    private final ActivityTypeRepository activityTypeRepository;
    private final EmissionFactorMapper mapper;

    @Override
    @Transactional
    public EmissionFactorDto createEmissionFactor(final EmissionFactorCreateDto createDto) {
        log.info("Creating emission factor for: {}", createDto.getActivityType());
        
        if (repository.existsByActivityTypeCode(createDto.getActivityType())) {
            throw new BadRequestException("Emission factor for activity type already exists: " + createDto.getActivityType());
        }
        
        ActivityType type = activityTypeRepository.findByCode(createDto.getActivityType())
            .orElseThrow(() -> new ResourceNotFoundException("ActivityType", "code", createDto.getActivityType()));
        
        EmissionFactor entity = mapper.toEntity(createDto);
        entity.setActivityType(type);
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
        EmissionFactor entity = repository.findByActivityTypeCode(activityType)
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
            if (!entity.getActivityType().getCode().equalsIgnoreCase(updateDto.getActivityType()) &&
                repository.existsByActivityTypeCode(updateDto.getActivityType())) {
                throw new BadRequestException("Emission factor for activity type already exists: " + updateDto.getActivityType());
            }
            ActivityType type = activityTypeRepository.findByCode(updateDto.getActivityType().trim())
                .orElseThrow(() -> new ResourceNotFoundException("ActivityType", "code", updateDto.getActivityType().trim()));
            entity.setActivityType(type);
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
