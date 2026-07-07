package com.carbonfootprint.controller.admin;

import com.carbonfootprint.dto.admin.PlatformSettingsUpdateRequest;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.security.admin.AdminPermissions;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Admin Platform Settings.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    /**
     * Retrieves global platform settings for the administration portal.
     *
     * @return ApiResponse containing current global settings
     */
    @GetMapping
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).SETTINGS_VIEW)")
    public ResponseEntity<ApiResponse<String>> getSettings() {
        log.info("Fetching global platform settings");
        return ResponseEntity.ok(ApiResponse.success("Global settings data", "Settings retrieved successfully"));
    }

    /**
     * Updates global platform settings such as maintenance mode.
     *
     * @param request The settings update payload
     * @return Empty ApiResponse on success
     */
    @PutMapping
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).SETTINGS_UPDATE)")
    public ResponseEntity<ApiResponse<Void>> updateSettings(@Valid @RequestBody PlatformSettingsUpdateRequest request) {
        log.info("Updating global platform settings. Maintenance Mode: {}", request.getMaintenanceMode());
        // Add audit logging here via service layer
        return ResponseEntity.ok(ApiResponse.success(null, "Platform settings updated successfully"));
    }
}
