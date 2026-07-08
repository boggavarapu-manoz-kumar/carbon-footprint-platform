package com.carbonfootprint.controller.admin;

import com.carbonfootprint.entity.admin.AdminNotification;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.security.admin.AdminPermissions;
import com.carbonfootprint.service.admin.AdminNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Admin Notification Center.
 * Provides endpoints for viewing, marking-as-read and managing admin notifications.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final AdminNotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ANALYTICS_VIEW)")
    public ResponseEntity<ApiResponse<List<AdminNotification>>> getNotifications() {
        log.debug("Fetching admin notifications");
        // Admin user ID 1 is the seeded default admin; in a multi-admin setup this
        // would be extracted from the authenticated principal.
        List<AdminNotification> notifications = notificationService.getNotificationsForAdmin(1L);
        return ResponseEntity.ok(ApiResponse.success(notifications, "Notifications retrieved"));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ANALYTICS_VIEW)")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        log.info("Marking notification {} as read", id);
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Marked as read"));
    }

    @PatchMapping("/read-all")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ANALYTICS_VIEW)")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        log.info("Marking all notifications as read");
        notificationService.markAllAsRead(1L);
        return ResponseEntity.ok(ApiResponse.success(null, "All marked as read"));
    }
}
