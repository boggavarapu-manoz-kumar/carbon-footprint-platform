package com.carbonfootprint.dto.admin;

import java.time.LocalDate;

public record UserGrowthResponse(
    LocalDate date,
    long newRegistrations,
    long totalUsers
) {}
