package com.carbonfootprint.dto.admin;

import java.math.BigDecimal;

/**
 * Immutable Record DTO for Dashboard Metrics.
 */
public record DashboardMetricsResponse(
    long totalUsers,
    long activeUsers,
    long newRegistrations,
    BigDecimal totalCarbonEmissions,
    long totalActivities,
    long suspendedUsers,
    long securityAlerts,
    long adminCount
) {}
