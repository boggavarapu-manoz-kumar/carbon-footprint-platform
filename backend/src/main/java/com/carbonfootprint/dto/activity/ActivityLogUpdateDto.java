package com.carbonfootprint.dto.activity;

import com.carbonfootprint.entity.ActivityCategory;
import jakarta.validation.constraints.DecimalMin;
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
public class ActivityLogUpdateDto {
    private String dynamicInputs;
    String activityType;
    
    BigDecimal quantity;
    
    String unit;
    
    
    LocalDate logDate;
}
