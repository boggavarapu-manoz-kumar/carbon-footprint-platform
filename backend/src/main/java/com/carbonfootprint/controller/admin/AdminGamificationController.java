package com.carbonfootprint.controller.admin;

import com.carbonfootprint.entity.GamificationSettings;
import com.carbonfootprint.repository.GamificationSettingsRepository;
import com.carbonfootprint.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.carbonfootprint.event.GamificationEvent;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.GoalRepository;
import org.springframework.context.ApplicationEventPublisher;
import java.util.List;

/**
 * Controller for Admin Gamification Settings.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/gamification-settings")
@RequiredArgsConstructor
public class AdminGamificationController {

    private final GamificationSettingsRepository gamificationSettingsRepository;
    private final ActivityLogRepository activityLogRepository;
    private final GoalRepository goalRepository;
    private final ApplicationEventPublisher eventPublisher;

    @GetMapping
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).SETTINGS_VIEW)")
    public ResponseEntity<ApiResponse<List<GamificationSettings>>> getSettings() {
        log.info("Fetching all gamification settings");
        List<GamificationSettings> settings = gamificationSettingsRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(settings, "Gamification settings retrieved successfully"));
    }

    @PutMapping
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).SETTINGS_UPDATE)")
    public ResponseEntity<ApiResponse<Void>> updateSettings(@RequestBody List<GamificationSettings> updates) {
        log.info("Updating gamification settings");
        
        for (GamificationSettings update : updates) {
            gamificationSettingsRepository.findBySettingKey(update.getSettingKey()).ifPresent(existing -> {
                existing.setSettingValue(update.getSettingValue());
                gamificationSettingsRepository.save(existing);
            });
        }
        
        return ResponseEntity.ok(ApiResponse.success(null, "Gamification settings updated successfully"));
    }

    @PostMapping("/backfill")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).SETTINGS_UPDATE)")
    public ResponseEntity<ApiResponse<String>> backfillPoints() {
        log.info("Starting gamification point backfill for existing records...");
        
        // Backfill Activities
        activityLogRepository.findAll().forEach(activity -> {
            eventPublisher.publishEvent(new GamificationEvent(this, activity.getUser().getId(), GamificationEvent.EventType.ACTIVITY_LOGGED, "FIRST_ACTIVITY_LOGGED", "ACTIVITY_LOG", String.valueOf(activity.getId()), null));
        });
        
        // Backfill Goals
        goalRepository.findAll().forEach(goal -> {
            eventPublisher.publishEvent(new GamificationEvent(this, goal.getUser().getId(), GamificationEvent.EventType.GOAL_CREATED, "GOAL_CREATED", "GOAL", "goal_" + goal.getId(), null));
            if (goal.getStatus() == com.carbonfootprint.entity.GoalStatus.ACHIEVED) {
                eventPublisher.publishEvent(new GamificationEvent(this, goal.getUser().getId(), GamificationEvent.EventType.GOAL_COMPLETED, "GOAL_COMPLETED", "GOAL", "goal_comp_" + goal.getId(), null));
            }
        });
        
        return ResponseEntity.ok(ApiResponse.success("Backfill triggered successfully", "Backfill complete"));
    }
}
