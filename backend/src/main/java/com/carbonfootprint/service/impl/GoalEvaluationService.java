package com.carbonfootprint.service.impl;

import com.carbonfootprint.service.GoalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoalEvaluationService {

    private final GoalService goalService;

    /**
     * Runs every hour to continuously monitor progress and intelligently determine
     * whether users are on track to achieve their goals using real database data.
     */
    @Scheduled(cron = "0 * * * * *")
    public void evaluateAllActiveGoals() {
        log.info("Starting hourly evaluation of active goals...");
        try {
            goalService.evaluateGoals();
            log.info("Successfully completed evaluation of active goals.");
        } catch (Exception e) {
            log.error("Failed to evaluate goals: {}", e.getMessage(), e);
        }
    }
}
