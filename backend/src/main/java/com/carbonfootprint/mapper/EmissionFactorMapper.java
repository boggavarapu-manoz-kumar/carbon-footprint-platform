package com.carbonfootprint.mapper;

import com.carbonfootprint.dto.emission.EmissionFactorCreateDto;
import com.carbonfootprint.dto.emission.EmissionFactorDto;
import com.carbonfootprint.entity.EmissionFactor;
import org.springframework.stereotype.Component;

@Component
public class EmissionFactorMapper {

    public EmissionFactor toEntity(EmissionFactorCreateDto dto) {
        if (dto == null) return null;
        return EmissionFactor.builder()
                .activityType(dto.getActivityType())
                .factorValue(dto.getFactorValue())
                .unit(dto.getUnit())
                .source(dto.getSource())
                .build();
    }

    public EmissionFactorDto toDto(EmissionFactor entity) {
        if (entity == null) return null;
        return EmissionFactorDto.builder()
                .id(entity.getId())
                .activityType(entity.getActivityType())
                .factorValue(entity.getFactorValue())
                .unit(entity.getUnit())
                .source(entity.getSource())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
