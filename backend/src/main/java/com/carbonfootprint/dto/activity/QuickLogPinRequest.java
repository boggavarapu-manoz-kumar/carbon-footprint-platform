package com.carbonfootprint.dto.activity;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuickLogPinRequest {
    @NotNull(message = "Activity Type ID is required")
    private Long activityTypeId;
    
    private String dynamicInputs; // Optional
}
