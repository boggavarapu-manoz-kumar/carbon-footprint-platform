package com.carbonfootprint.service;

import com.carbonfootprint.dto.WeeklyGoalProgressDTO;

public interface WeeklyGoalProgressService {
    WeeklyGoalProgressDTO getWeeklyProgress(Long userId);
}
