package com.carbonfootprint.dto.activity;

import com.carbonfootprint.entity.ActivityCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;

@Value
@Builder
public class ActivityLogCreateDto {

    @NotNull(message = "Category is required")
    ActivityCategory category;

    @NotBlank(message = "Activity type is required")
    String activityType;

    @NotNull(message = "Quantity is required")
    BigDecimal quantity;

    @NotBlank(message = "Unit is required")
    String unit;


    @NotNull(message = "Log date is required")
    LocalDate logDate;
}
