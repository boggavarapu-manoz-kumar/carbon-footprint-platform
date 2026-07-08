package com.carbonfootprint.controller.admin;

import com.carbonfootprint.dto.admin.AdminUserResponse;
import com.carbonfootprint.dto.admin.UserStatusUpdateRequest;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.admin.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
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

    private final AdminUserService adminUserService;

    /**
     * Retrieves a paginated, searchable list of all platform users.
     */
    @GetMapping
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).USERS_VIEW)")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        log.info("Fetching users — page={}, size={}, search={}", page, size, search);
        Page<AdminUserResponse> users = adminUserService.getUsers(search, page, size, sortBy, direction);
        return ResponseEntity.ok(ApiResponse.success(users, "Users fetched successfully"));
    }

    /**
     * Retrieves detailed profile for a specific user.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).USERS_VIEW)")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUser(@PathVariable Long id) {
        log.info("Fetching user details for id: {}", id);
        AdminUserResponse user = adminUserService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user, "User fetched successfully"));
    }

    /**
     * Updates the status of a specific user (ACTIVE, SUSPENDED, LOCKED).
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).USERS_UPDATE)")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequest request) {
        log.info("Admin updating user {} status to: {}", id, request.getStatus());
        adminUserService.updateUserStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(null, "User status updated to " + request.getStatus()));
    }

    /**
     * Convenience endpoint: Suspends a specific user.
     */
    @PostMapping("/{id}/suspend")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).USERS_UPDATE)")
    public ResponseEntity<ApiResponse<Void>> suspendUser(@PathVariable Long id) {
        log.info("Admin suspending user {}", id);
        adminUserService.updateUserStatus(id,
                UserStatusUpdateRequest.builder().status("SUSPENDED").reason("Admin action").build());
        return ResponseEntity.ok(ApiResponse.success(null, "User suspended successfully"));
    }

    /**
     * Convenience endpoint: Restores a suspended user.
     */
    @PostMapping("/{id}/restore")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).USERS_UPDATE)")
    public ResponseEntity<ApiResponse<Void>> restoreUser(@PathVariable Long id) {
        log.info("Admin restoring user {}", id);
        adminUserService.updateUserStatus(id,
                UserStatusUpdateRequest.builder().status("ACTIVE").reason("Admin restore action").build());
        return ResponseEntity.ok(ApiResponse.success(null, "User restored successfully"));
    }
}
