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
 * Controller for Admin Analytics.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    /**
     * Retrieves aggregated carbon analytics trends over a specific date range.
     *
     * @param startDate Optional start date ISO-8601
     * @param endDate Optional end date ISO-8601
     * @return ApiResponse containing the analytics data
     */
    @GetMapping("/trends")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ANALYTICS_VIEW)")
    public ResponseEntity<ApiResponse<String>> getAnalyticsTrends(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        log.info("Fetching analytics trends from {} to {}", startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Analytics trends data", "Analytics retrieved successfully"));
    }
}
