package com.carbonfootprint.controller.admin;

import com.carbonfootprint.dto.admin.AdminMonitoringActivityDTO;
import com.carbonfootprint.dto.admin.AdminMonitoringFilterDTO;
import com.carbonfootprint.dto.admin.ActivityRejectRequest;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.security.admin.AdminPermissions;
import com.carbonfootprint.service.admin.AdminActivityMonitorService;
import com.carbonfootprint.service.admin.AdminActivityInspectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Admin Activity Management.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/activities")
@RequiredArgsConstructor
public class AdminActivityController {

    private final AdminActivityMonitorService activityMonitorService;
    private final AdminActivityInspectionService activityInspectionService;

    /**
     * Retrieves a paginated list of all activities pending moderation.
     *
     * @return ApiResponse containing list of activities
     */
    @GetMapping
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ACTIVITIES_VIEW)")
    public ResponseEntity<ApiResponse<String>> getActivities() {
        log.info("Fetching paginated activities list");
        return ResponseEntity.ok(ApiResponse.success("Activities list", "Activities fetched successfully"));
    }

    /**
     * Retrieves a paginated list of all activities (regular and custom) for monitoring.
     */
    @PostMapping("/monitor")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ACTIVITIES_VIEW)")
    public ResponseEntity<ApiResponse<Page<AdminMonitoringActivityDTO>>> getMonitoringActivities(
            @RequestBody AdminMonitoringFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Fetching monitoring activities with filter: {}, page: {}, size: {}", filter, page, size);
        Page<AdminMonitoringActivityDTO> activities = activityMonitorService.getActivities(filter, page, size);
        return ResponseEntity.ok(ApiResponse.success(activities, "Activities fetched successfully"));
    }

    /**
     * Retrieves detailed inspection data and full history for a specific activity.
     */
    @GetMapping("/monitor/{id}")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ACTIVITIES_VIEW)")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> inspectActivity(
            @PathVariable Long id,
            @RequestParam String type) {
        log.info("Inspecting activity ID: {} Type: {}", id, type);
        java.util.Map<String, Object> details = activityInspectionService.inspectActivity(id, type);
        return ResponseEntity.ok(ApiResponse.success(details, "Activity details fetched successfully"));
    }

    /**
     * Approves a specific carbon offset activity.
     *
     * @param id The ID of the activity
     * @return Empty ApiResponse on success
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ACTIVITIES_APPROVE)")
    public ResponseEntity<ApiResponse<Void>> approveActivity(@PathVariable Long id) {
        log.info("Approving activity: {}", id);
        // Add audit logging here via service layer
        return ResponseEntity.ok(ApiResponse.success(null, "Activity approved successfully"));
    }

    /**
     * Rejects a specific carbon offset activity with a mandatory reason.
     *
     * @param id The ID of the activity
     * @param request Payload containing the rejection reason
     * @return Empty ApiResponse on success
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ACTIVITIES_APPROVE)")
    public ResponseEntity<ApiResponse<Void>> rejectActivity(@PathVariable Long id, @Valid @RequestBody ActivityRejectRequest request) {
        log.info("Rejecting activity {} with reason: {}", id, request.getRejectionReason());
        // Add audit logging here via service layer
        return ResponseEntity.ok(ApiResponse.success(null, "Activity rejected successfully"));
    }
}
