package com.carbonfootprint.service;

import java.math.BigDecimal;

import com.carbonfootprint.dto.activity.CalculationResponseDto;

public interface EmissionCalculationService {
    CalculationResponseDto calculateEmission(String activityType, BigDecimal quantity, String unit);
}
