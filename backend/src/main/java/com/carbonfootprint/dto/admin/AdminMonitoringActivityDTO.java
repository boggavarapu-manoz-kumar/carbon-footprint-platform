package com.carbonfootprint.dto.admin;

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
public class AdminMonitoringActivityDTO {
    private String logType; // 'REGULAR' or 'OTHER'
    private Long id;
    private String activityName;
    private String category;
    private String userName;
    private String userEmail;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal carbonEmission;
    private LocalDate logDate;
    private LocalTime logTime;
    private LocalDateTime createdAt;
}
