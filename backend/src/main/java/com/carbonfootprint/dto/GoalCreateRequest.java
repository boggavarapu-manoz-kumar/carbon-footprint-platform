package com.carbonfootprint.dto;

import com.carbonfootprint.entity.GoalType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GoalCreateRequest {
    @NotBlank(message = "Goal name is required")
    private String name;

    private String description;

    @NotNull(message = "Goal type is required")
    private GoalType goalType;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate targetDate;

    // Optional, depending on goalType
    private BigDecimal targetReductionPercent;
    
    // Optional, depending on goalType
    private BigDecimal targetEmission;
}
