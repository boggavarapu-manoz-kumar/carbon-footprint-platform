package com.carbonfootprint.service;

import com.carbonfootprint.dto.analytics.AnalyticsResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface AnalyticsService {
    AnalyticsResponseDto getDailyAnalytics(String userEmail, LocalDate date, String category);
    AnalyticsResponseDto getWeeklyAnalytics(String userEmail, LocalDate date, String category);
    AnalyticsResponseDto getMonthlyAnalytics(String userEmail, LocalDate date, String category);
    AnalyticsResponseDto getYearlyAnalytics(String userEmail, Integer year, String category);
    List<Integer> getAvailableYears(String userEmail);
}
