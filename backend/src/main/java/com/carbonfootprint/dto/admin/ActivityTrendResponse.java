package com.carbonfootprint.dto.admin;

import java.time.LocalDate;

public record ActivityTrendResponse(
    LocalDate date,
    long activityCount
) {}
