package com.carbonfootprint.dto.admin;

import java.math.BigDecimal;

public record CategoryAnalyticsResponse(
    String category,
    BigDecimal totalEmissions,
    long activityCount
) {}
