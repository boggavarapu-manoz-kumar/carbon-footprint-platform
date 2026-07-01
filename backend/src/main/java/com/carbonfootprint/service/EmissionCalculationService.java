package com.carbonfootprint.service;

import java.math.BigDecimal;

public interface EmissionCalculationService {
    BigDecimal calculateEmission(String activityType, BigDecimal quantity, String unit);
}
