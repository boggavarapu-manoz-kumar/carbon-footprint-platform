package com.carbonfootprint.controller.admin;

import com.carbonfootprint.dto.admin.PlatformSettingsUpdateRequest;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.security.admin.AdminPermissions;
import com.carbonfootprint.service.admin.PlatformSettingService;
import com.carbonfootprint.service.impl.GeminiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for Admin Platform Settings — fully dynamic, database-backed.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final PlatformSettingService settingService;
    private final GeminiService geminiService;

    /**
     * Retrieves all global platform settings as a key→value map from the database.
     */
    @GetMapping
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).SETTINGS_VIEW)")
    public ResponseEntity<ApiResponse<Map<String, String>>> getSettings() {
        log.info("Fetching all platform settings");
        Map<String, String> settings = settingService.getSettingsAsMap();
        return ResponseEntity.ok(ApiResponse.success(settings, "Settings retrieved successfully"));
    }

    /**
     * Retrieves Gemini AI health status.
     */
    @GetMapping("/gemini-health")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).SETTINGS_VIEW)")
    public ResponseEntity<ApiResponse<Map<String, String>>> getGeminiHealth() {
        log.info("Fetching Gemini AI Health Status");
        return ResponseEntity.ok(ApiResponse.success(geminiService.getHealthStatus(), "Health retrieved successfully"));
    }

    /**
     * Updates platform settings (key→value map). Any key not present in DB is ignored.
     */
    @PutMapping
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).SETTINGS_UPDATE)")
    public ResponseEntity<ApiResponse<Void>> updateSettings(@RequestBody Map<String, String> updates) {
        log.info("Updating platform settings: {}", updates.keySet());
        settingService.updateSettings(updates);
        return ResponseEntity.ok(ApiResponse.success(null, "Settings updated successfully"));
    }

    /**
     * Purge the application cache (Redis flush). SUPER_ADMIN only.
     */
    @PostMapping("/purge-cache")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).SETTINGS_UPDATE)")
    public ResponseEntity<ApiResponse<Void>> purgeCache() {
        log.warn("Cache purge initiated by admin");
        settingService.purgeCache();
        return ResponseEntity.ok(ApiResponse.success(null, "Cache purged successfully"));
    }
}
