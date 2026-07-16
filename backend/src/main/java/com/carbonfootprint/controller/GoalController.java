package com.carbonfootprint.controller;

import com.carbonfootprint.dto.GoalAlertDTO;
import com.carbonfootprint.dto.GoalAnalyticsDTO;
import com.carbonfootprint.dto.GoalCreateRequest;
import com.carbonfootprint.dto.GoalPredictionDTO;
import com.carbonfootprint.dto.GoalResponse;
import com.carbonfootprint.dto.GoalUpdateRequest;
import com.carbonfootprint.dto.GoalStatusUpdateRequest;
import com.carbonfootprint.dto.GoalHistoryResponse;
import com.carbonfootprint.dto.WeeklyGoalProgressDTO;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.service.GoalAlertService;
import com.carbonfootprint.service.GoalAnalyticsService;
import com.carbonfootprint.service.GoalPredictionService;
import com.carbonfootprint.service.GoalService;
import com.carbonfootprint.service.WeeklyGoalProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;
    private final WeeklyGoalProgressService weeklyGoalProgressService;
    private final GoalPredictionService goalPredictionService;
    private final GoalAlertService goalAlertService;
    private final GoalAnalyticsService goalAnalyticsService;

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody GoalCreateRequest request) {
        return new ResponseEntity<>(goalService.createGoal(user.getId(), request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getUserGoals(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(goalService.getUserGoals(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalResponse> getGoalDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(goalService.getGoalDetails(id, user.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> updateGoal(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody GoalUpdateRequest request) {
        return ResponseEntity.ok(goalService.updateGoal(id, user.getId(), request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<GoalResponse> changeGoalStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody GoalStatusUpdateRequest request) {
        return ResponseEntity.ok(goalService.changeGoalStatus(id, user.getId(), request));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<GoalHistoryResponse>> getGoalHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(goalService.getGoalHistory(id, user.getId()));
    }

    @GetMapping("/weekly-progress")
    public ResponseEntity<WeeklyGoalProgressDTO> getWeeklyProgress(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(weeklyGoalProgressService.getWeeklyProgress(user.getId()));
    }

    @GetMapping("/{id}/prediction")
    public ResponseEntity<GoalPredictionDTO> getGoalPrediction(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(goalPredictionService.getGoalPrediction(id, user.getId()));
    }

    @GetMapping("/alerts")
    public ResponseEntity<java.util.List<GoalAlertDTO>> getGoalAlerts(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(goalAlertService.getGoalAlerts(user.getId()));
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<GoalAnalyticsDTO> getGoalAnalytics(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(goalAnalyticsService.getGoalAnalytics(id, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        goalService.deleteGoal(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
