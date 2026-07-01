package com.carbonfootprint.dto.activity;

import com.carbonfootprint.entity.ActivityCategory;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Value
@Builder
public class ActivityLogDto {
    Long id;
    Long userId;
    ActivityCategory category;
    String activityType;
    BigDecimal quantity;
    String unit;
    BigDecimal emissionValue;
    LocalDate logDate;
    LocalDateTime createdAt;
}
