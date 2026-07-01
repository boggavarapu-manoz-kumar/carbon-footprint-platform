package com.carbonfootprint.dto.emission;

import jakarta.validation.constraints.DecimalMin;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class EmissionFactorUpdateDto {

    String activityType;

    @DecimalMin(value = "0.0", message = "Factor value must be non-negative")
    BigDecimal factorValue;

    String unit;

    String source;
}
