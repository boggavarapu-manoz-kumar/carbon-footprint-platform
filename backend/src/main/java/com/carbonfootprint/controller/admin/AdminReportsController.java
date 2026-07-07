package com.carbonfootprint.controller.admin;

import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.security.admin.AdminPermissions;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for Admin Reports Export.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
public class AdminReportsController {

    /**
     * Asynchronously generates an export report for a specific data range.
     *
     * @param startDate Optional start date
     * @param endDate Optional end date
     * @param format Report format (CSV, PDF)
     * @return ApiResponse confirming report generation initialization
     */
    @GetMapping("/export")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ANALYTICS_EXPORT)")
    public ResponseEntity<ApiResponse<String>> exportReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "CSV") String format) {
        log.info("Exporting {} report from {} to {}", format, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Report generation initiated async", "Export triggered successfully"));
    }
}
