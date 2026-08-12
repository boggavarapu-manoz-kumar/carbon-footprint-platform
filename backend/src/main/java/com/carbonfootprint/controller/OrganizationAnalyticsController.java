package com.carbonfootprint.controller;

import com.carbonfootprint.dto.organization.analytics.OrganizationAnalyticsDto;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.OrganizationAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/organizations/{orgId}/analytics")
@RequiredArgsConstructor
public class OrganizationAnalyticsController {

    private final OrganizationAnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("@orgSecurity.hasOrganizationAdminAccess(#orgId)")
    public ResponseEntity<ApiResponse<OrganizationAnalyticsDto>> getOrganizationAnalytics(
            @PathVariable Long orgId,
            @RequestParam(required = false, defaultValue = "WEEKLY") String period,
            @RequestParam(required = false) String customStartDate,
            @RequestParam(required = false) String customEndDate) {
        
        log.info("REST request to get Organization Analytics for orgId: {}", orgId);
        
        OrganizationAnalyticsDto analytics = analyticsService.getAnalytics(orgId, period, customStartDate, customEndDate);
        
        return ResponseEntity.ok(ApiResponse.success(analytics, "Successfully retrieved organization analytics."));
    }
}
