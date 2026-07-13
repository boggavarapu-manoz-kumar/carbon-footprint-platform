package com.carbonfootprint.controller.admin;

import com.carbonfootprint.dto.admin.AdminUserResponse;
import com.carbonfootprint.dto.admin.UserStatusUpdateRequest;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.dto.admin.SuspendUserRequest;
import com.carbonfootprint.dto.admin.UserSuspensionResponse;
import com.carbonfootprint.service.admin.AdminUserService;
import com.carbonfootprint.service.admin.UserSuspensionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.entity.admin.AdminUser;

import java.util.List;

/**
 * Controller for Admin User Management.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final UserSuspensionService userSuspensionService;

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

    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).USERS_UPDATE) or hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    @PostMapping("/{userId}/suspend")
    public ResponseEntity<ApiResponse<Void>> suspendUser(
            @PathVariable Long userId,
            @RequestBody SuspendUserRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {
        log.info("Suspending user {}", userId);
        String adminId = ((AdminUser) currentUser).getId();
        userSuspensionService.suspendUser(userId, request, adminId);
        return ResponseEntity.ok(ApiResponse.success(null, "User suspended successfully"));
    }

    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).USERS_UPDATE) or hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    @PostMapping("/{userId}/unsuspend")
    public ResponseEntity<ApiResponse<Void>> unsuspendUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails currentUser) {
        log.info("Unsuspending user {}", userId);
        String adminId = ((AdminUser) currentUser).getId();
        userSuspensionService.unsuspendUser(userId, adminId);
        return ResponseEntity.ok(ApiResponse.success(null, "User unsuspended successfully"));
    }

    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).USERS_VIEW) or hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    @GetMapping("/{userId}/suspensions")
    public ResponseEntity<ApiResponse<List<UserSuspensionResponse>>> getSuspensionHistory(
            @PathVariable Long userId) {
        log.info("Fetching suspension history for user {}", userId);
        return ResponseEntity.ok(ApiResponse.success(
                userSuspensionService.getSuspensionHistory(userId), "Suspension history fetched successfully"));
    }
}
