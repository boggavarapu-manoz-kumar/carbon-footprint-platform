package com.carbonfootprint.dto.emission;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmissionFactorUpdateDto {

    String activityType;

    @DecimalMin(value = "0.0", message = "Factor value must be non-negative")
    BigDecimal factorValue;

    String unit;

    String source;
}
