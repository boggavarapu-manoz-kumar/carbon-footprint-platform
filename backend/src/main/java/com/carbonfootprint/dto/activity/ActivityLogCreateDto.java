package com.carbonfootprint.dto.activity;

import com.carbonfootprint.entity.ActivityCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
