package com.carbonfootprint.dto.activity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtherActivityLogDto {
    private Long id;
    private String activityName;
    private String activityDescription;
    private BigDecimal quantity;
    private String unit;
    private LocalDate logDate;
    private LocalTime logTime;
    private BigDecimal carbonValue;
    private String notes;
    private LocalDateTime createdAt;
}
