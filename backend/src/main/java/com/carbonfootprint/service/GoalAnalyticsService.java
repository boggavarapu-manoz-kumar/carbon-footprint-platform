package com.carbonfootprint.service;

import com.carbonfootprint.dto.GoalAnalyticsDTO;

public interface GoalAnalyticsService {
    GoalAnalyticsDTO getGoalAnalytics(Long goalId, Long userId);
}
