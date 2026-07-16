package com.carbonfootprint.service;

import com.carbonfootprint.dto.GoalCreateRequest;
import com.carbonfootprint.dto.GoalResponse;

import com.carbonfootprint.dto.GoalStatusUpdateRequest;
import com.carbonfootprint.dto.GoalUpdateRequest;
import com.carbonfootprint.dto.GoalHistoryResponse;

import java.util.List;

public interface GoalService {
    GoalResponse createGoal(Long userId, GoalCreateRequest request);
    List<GoalResponse> getUserGoals(Long userId);
    GoalResponse getGoalDetails(Long goalId, Long userId);
    GoalResponse updateGoal(Long goalId, Long userId, GoalUpdateRequest request);
    GoalResponse changeGoalStatus(Long goalId, Long userId, GoalStatusUpdateRequest request);
    List<GoalHistoryResponse> getGoalHistory(Long goalId, Long userId);
    void deleteGoal(Long goalId, Long userId);
    void evaluateUserGoals(Long userId);
    void evaluateGoals();
}
