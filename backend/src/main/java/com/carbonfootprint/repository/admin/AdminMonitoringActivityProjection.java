package com.carbonfootprint.repository.admin;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public interface AdminMonitoringActivityProjection {
    String getLogType();
    Long getId();
    String getActivityName();
    String getCategory();
    String getUserName();
    String getUserEmail();
    BigDecimal getQuantity();
    String getUnit();
    BigDecimal getCarbonEmission();
    LocalDate getLogDate();
    LocalTime getLogTime();
    LocalDateTime getCreatedAt();
}
