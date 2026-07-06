package com.carbonfootprint.dto.activity;

import com.carbonfootprint.entity.ActivityCategory;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalculationRequestDto {

    @NotNull(message = "Category is required")
    private String dynamicInputs;

    @NotNull(message = "Activity type is required")
    private String activityType;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    @NotNull(message = "Unit is required")
    private String unit;
}
