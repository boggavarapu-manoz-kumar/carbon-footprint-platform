package com.carbonfootprint.dto.activity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtherActivityLogCreateDto {

    @NotBlank(message = "Activity name is required")
    private String activityName;

    private String activityDescription;

    @NotNull(message = "Quantity is required")
    @jakarta.validation.constraints.DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    private LocalTime logTime;

    private BigDecimal carbonValue;

    private String notes;
}
