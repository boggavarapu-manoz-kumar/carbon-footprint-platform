package com.carbonfootprint.controller.admin;

import com.carbonfootprint.dto.admin.BulkSuspendRequest;
import com.carbonfootprint.dto.admin.UserSuspensionResponse;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.admin.UserSuspensionService;
import com.carbonfootprint.entity.admin.AdminUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/suspensions")
@RequiredArgsConstructor
public class AdminSuspensionController {

    private final UserSuspensionService userSuspensionService;

    @GetMapping
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).USERS_VIEW) or hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserSuspensionResponse>>> getGlobalSuspensions(
            @RequestParam(required = false, defaultValue = "All") String status,
            @RequestParam(required = false, defaultValue = "All Time") String dateRange,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        log.info("Fetching global suspensions — status={}, dateRange={}", status, dateRange);
        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<UserSuspensionResponse> suspensions = userSuspensionService.getGlobalSuspensions(status, dateRange, pageable);
        return ResponseEntity.ok(ApiResponse.success(suspensions, "Suspensions fetched successfully"));
    }

    @PostMapping("/bulk-suspend")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).USERS_UPDATE) or hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> bulkSuspend(
            @Valid @RequestBody BulkSuspendRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {
        log.info("Bulk suspending {} users", request.getUserIds().size());
        String adminId = ((AdminUser) currentUser).getId();
        userSuspensionService.bulkSuspend(request, adminId);
        return ResponseEntity.ok(ApiResponse.success(null, "Users suspended successfully"));
    }

    @GetMapping("/export")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).USERS_EXPORT) or hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Resource> exportSuspensions() {
        log.info("Exporting suspension records");
        ByteArrayInputStream in = userSuspensionService.exportSuspensions();
        InputStreamResource file = new InputStreamResource(in);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=suspensions_export.csv")
                .contentType(MediaType.parseMediaType("application/csv"))
                .body(file);
    }
}
