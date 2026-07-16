package com.carbonfootprint.service;

import com.carbonfootprint.dto.GoalAlertDTO;

import java.util.List;

public interface GoalAlertService {
    List<GoalAlertDTO> getGoalAlerts(Long userId);
}
