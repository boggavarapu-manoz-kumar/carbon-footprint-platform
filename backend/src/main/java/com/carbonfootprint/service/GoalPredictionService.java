package com.carbonfootprint.service;

import com.carbonfootprint.dto.GoalPredictionDTO;

public interface GoalPredictionService {
    GoalPredictionDTO getGoalPrediction(Long goalId, Long userId);
}
