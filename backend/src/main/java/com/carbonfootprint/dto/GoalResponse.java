package com.carbonfootprint.dto;

import com.carbonfootprint.entity.GoalStatus;
import com.carbonfootprint.entity.GoalType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class GoalResponse {
    private Long id;
    private String name;
    private String description;
    private GoalType goalType;
    private LocalDate startDate;
    private LocalDate targetDate;
    
    private BigDecimal targetReductionPercent;
    private BigDecimal targetEmission;
    private BigDecimal baselineEmission;
    
    private GoalStatus status;
    private BigDecimal progressPercent;
    private LocalDate estimatedCompletionDate;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
