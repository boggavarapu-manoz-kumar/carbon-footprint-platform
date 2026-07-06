package com.carbonfootprint.service;

import com.carbonfootprint.dto.activity.StatisticsDto;

public interface StatisticsService {
    StatisticsDto getDashboardStatistics(String username);
}
