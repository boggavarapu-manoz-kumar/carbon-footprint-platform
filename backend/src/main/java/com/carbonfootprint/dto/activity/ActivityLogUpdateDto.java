package com.carbonfootprint.dto.activity;

import com.carbonfootprint.entity.ActivityCategory;
import jakarta.validation.constraints.DecimalMin;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;

@Value
@Builder
public class ActivityLogUpdateDto {
    ActivityCategory category;
    String activityType;
    
    BigDecimal quantity;
    
    String unit;
    
    
    LocalDate logDate;
}
