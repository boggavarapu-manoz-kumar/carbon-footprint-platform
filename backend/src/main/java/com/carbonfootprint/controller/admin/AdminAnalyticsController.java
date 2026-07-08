package com.carbonfootprint.controller.admin;

import com.carbonfootprint.dto.admin.ActivityTrendResponse;
import com.carbonfootprint.dto.admin.CategoryAnalyticsResponse;
import com.carbonfootprint.dto.admin.UserGrowthResponse;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.admin.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final AdminAnalyticsService analyticsService;

    @GetMapping("/users/growth")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ANALYTICS_VIEW)")
    public ResponseEntity<ApiResponse<List<UserGrowthResponse>>> getUserGrowth(
            @RequestParam(defaultValue = "30") int days) {
        log.info("Fetching user growth analytics for {} days", days);
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getUserGrowth(days), "User growth retrieved successfully"));
    }

    @GetMapping("/activities/trends")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ANALYTICS_VIEW)")
    public ResponseEntity<ApiResponse<List<ActivityTrendResponse>>> getActivityTrends(
            @RequestParam(defaultValue = "30") int days) {
        log.info("Fetching activity trends for {} days", days);
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getActivityTrends(days), "Activity trends retrieved successfully"));
    }

    @GetMapping("/categories")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ANALYTICS_VIEW)")
    public ResponseEntity<ApiResponse<List<CategoryAnalyticsResponse>>> getCategoryAnalytics() {
        log.info("Fetching category analytics");
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getCategoryAnalytics(), "Category analytics retrieved successfully"));
    }
}
