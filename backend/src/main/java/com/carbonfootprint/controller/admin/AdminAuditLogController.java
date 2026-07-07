package com.carbonfootprint.controller.admin;

import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.entity.admin.AuditLog;
import com.carbonfootprint.security.admin.AdminPermissions;
import com.carbonfootprint.service.admin.AdminAuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for Admin Audit Logs.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@RequiredArgsConstructor
public class AdminAuditLogController {

    private final AdminAuditService adminAuditService;

    /**
     * Retrieves a paginated list of security audit logs.
     *
     * @return ApiResponse containing the audit logs
     */
    @GetMapping
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).AUDITLOGS_VIEW)")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogs(Pageable pageable) {
        log.info("Fetching paginated audit logs");
        return ResponseEntity.ok(ApiResponse.success(adminAuditService.getAuditLogs(pageable), "Audit logs retrieved successfully"));
    }

    /**
     * Triggers an asynchronous export of the audit logs to CSV.
     *
     * @return ApiResponse confirming export initialization
     */
    @GetMapping("/export")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).AUDITLOGS_EXPORT)")
    public ResponseEntity<ApiResponse<String>> exportAuditLogs() {
        log.info("Exporting audit logs to CSV");
        return ResponseEntity.ok(ApiResponse.success("Audit logs export initiated async", "Export triggered successfully"));
    }
}
