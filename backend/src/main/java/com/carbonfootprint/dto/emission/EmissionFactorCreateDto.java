package com.carbonfootprint.dto.emission;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class EmissionFactorCreateDto {

    @NotBlank(message = "Activity type is required")
    String activityType;

    @NotNull(message = "Factor value is required")
    @DecimalMin(value = "0.0", message = "Factor value must be non-negative")
    BigDecimal factorValue;

    @NotBlank(message = "Unit is required")
    String unit;

    String source;
}
