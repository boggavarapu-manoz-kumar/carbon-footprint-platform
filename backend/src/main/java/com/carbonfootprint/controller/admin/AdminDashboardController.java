package com.carbonfootprint.controller.admin;

import com.carbonfootprint.dto.admin.DashboardMetricsResponse;
import com.carbonfootprint.dto.admin.EmissionTrendResponse;
import com.carbonfootprint.dto.admin.LeaderboardResponse;
import com.carbonfootprint.entity.admin.AdminSecurityEvent;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.security.admin.AdminPermissions;
import com.carbonfootprint.service.admin.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/metrics")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ANALYTICS_VIEW) or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<DashboardMetricsResponse>> getMetrics() {
        return ResponseEntity.ok(ApiResponse.success(
                adminDashboardService.getMetrics(),
                "Dashboard metrics retrieved successfully"
        ));
    }

    @GetMapping("/trends")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ANALYTICS_VIEW) or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<EmissionTrendResponse>>> getEmissionTrends(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(
                adminDashboardService.getEmissionTrends(days),
                "Emission trends retrieved successfully"
        ));
    }

    @GetMapping("/leaderboard")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ANALYTICS_VIEW) or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<LeaderboardResponse>>> getTopEmitters() {
        return ResponseEntity.ok(ApiResponse.success(
                adminDashboardService.getTopEmitters(),
                "Leaderboard retrieved successfully"
        ));
    }

    @GetMapping("/security-alerts")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).AUDIT_LOGS_VIEW) or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<AdminSecurityEvent>>> getSecurityAlerts() {
        return ResponseEntity.ok(ApiResponse.success(
                adminDashboardService.getRecentSecurityAlerts(),
                "Security alerts retrieved successfully"
        ));
    }
}
