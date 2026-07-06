package com.carbonfootprint.mapper;

import com.carbonfootprint.dto.activity.ActivityLogCreateDto;
import com.carbonfootprint.dto.activity.ActivityLogDto;
import com.carbonfootprint.entity.ActivityLog;
import org.springframework.stereotype.Component;

@Component
public class ActivityLogMapper {

    public ActivityLog toEntity(ActivityLogCreateDto dto) {
        if (dto == null) return null;
        return ActivityLog.builder()
                .dynamicInputs(dto.getDynamicInputs())
                // activityType must be set in the service layer where the repository is accessed
                .quantity(dto.getQuantity())
                .unit(dto.getUnit())
                .logDate(dto.getLogDate())
                .build();
    }

    public ActivityLogDto toDto(ActivityLog entity) {
        if (entity == null) return null;
        return ActivityLogDto.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .dynamicInputs(entity.getDynamicInputs())
                .activityType(entity.getActivityType() != null ? entity.getActivityType().getCode() : null)
                .quantity(entity.getQuantity())
                .unit(entity.getUnit())
                .emissionValue(entity.getEmissionValue())
                .logDate(entity.getLogDate())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
