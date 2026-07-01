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
                .category(dto.getCategory())
                .activityType(dto.getActivityType())
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
                .category(entity.getCategory())
                .activityType(entity.getActivityType())
                .quantity(entity.getQuantity())
                .unit(entity.getUnit())
                .emissionValue(entity.getEmissionValue())
                .logDate(entity.getLogDate())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
