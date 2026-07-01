package com.carbonfootprint.dto.emission;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Value
@Builder
public class EmissionFactorDto {
    Long id;
    String activityType;
    BigDecimal factorValue;
    String unit;
    String source;
    LocalDateTime createdAt;
}
