package com.carbonfootprint.dto.activity;

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

    private String dynamicInputs;

    @NotBlank(message = "Activity type is required")
    private String activityType;
    @NotNull(message = "Quantity is required")
    @jakarta.validation.constraints.DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be greater than zero")
    @jakarta.validation.constraints.DecimalMax(value = "999999.99", message = "Quantity is suspiciously large")
    BigDecimal quantity;

    @NotBlank(message = "Unit is required")
    String unit;


    @NotNull(message = "Log date is required")
    LocalDate logDate;
}
