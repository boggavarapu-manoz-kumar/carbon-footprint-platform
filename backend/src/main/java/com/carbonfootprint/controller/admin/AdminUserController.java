package com.carbonfootprint.controller.admin;

import com.carbonfootprint.dto.admin.UserStatusUpdateRequest;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.security.admin.AdminPermissions;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Admin User Management.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    /**
     * Retrieves a paginated list of all users.
     * 
     * @return ApiResponse containing list of users
     */
    @GetMapping
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).USERS_VIEW)")
    public ResponseEntity<ApiResponse<String>> getUsers() {
        log.info("Fetching paginated users list");
        return ResponseEntity.ok(ApiResponse.success("Users list", "Users fetched successfully"));
    }

    /**
     * Retrieves detailed profile for a specific user.
     *
     * @param id The ID of the user
     * @return ApiResponse containing user details
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).USERS_VIEW)")
    public ResponseEntity<ApiResponse<String>> getUser(@PathVariable Long id) {
        log.info("Fetching user details for id: {}", id);
        return ResponseEntity.ok(ApiResponse.success("User details", "User fetched successfully"));
    }

    /**
     * Updates the status of a specific user (e.g. SUSPEND, LOCK, ACTIVE).
     *
     * @param id The ID of the user
     * @param request The status update payload containing reason
     * @return Empty ApiResponse on success
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).USERS_UPDATE)")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(@PathVariable Long id, @Valid @RequestBody UserStatusUpdateRequest request) {
        log.info("Updating user {} status to: {}", id, request.getStatus());
        // Add audit logging here via service layer
        return ResponseEntity.ok(ApiResponse.success(null, "User status updated successfully"));
    }

    /**
     * Manually provisions a new user from the admin portal.
     *
     * @return Empty ApiResponse on success
     */
    @PostMapping
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).USERS_CREATE)")
    public ResponseEntity<ApiResponse<Void>> createUser() {
        log.info("Provisioning a new user manually from admin portal");
        return ResponseEntity.ok(ApiResponse.success(null, "User created successfully"));
    }
}
