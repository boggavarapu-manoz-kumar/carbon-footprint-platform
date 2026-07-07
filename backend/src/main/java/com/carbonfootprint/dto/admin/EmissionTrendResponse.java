package com.carbonfootprint.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Immutable Record DTO for Emission Trends.
 */
public record EmissionTrendResponse(
    LocalDate date,
    BigDecimal dailyEmission
) {}
