package com.carbonfootprint.controller;

import com.carbonfootprint.dto.leaderboard.LeaderboardEntryDto;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.OrganizationLeaderboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Organization Leaderboard — scoped entirely within one organization.
 * The global leaderboard lives at /api/leaderboard/* and is untouched.
 *
 * Security: any ACTIVE member of the org can view their org leaderboard.
 */
@Slf4j
@RestController
@RequestMapping("/api/org/{organizationId}/leaderboard")
@RequiredArgsConstructor
public class OrganizationLeaderboardController {

    private final OrganizationLeaderboardService leaderboardService;

    @GetMapping
    @PreAuthorize("@orgSecurity.hasOrganizationEmployeeAccess(#organizationId)")
    public ResponseEntity<ApiResponse<Page<LeaderboardEntryDto>>> getOrganizationLeaderboard(
            @PathVariable Long organizationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(defaultValue = "ALL_TIME") String timeframe,
            Authentication authentication) {

        log.info("Org Leaderboard request: orgId={}, timeframe={}, page={}", organizationId, timeframe, page);

        // Cap page size to prevent abuse (max 100 per call)
        int safeSize = Math.min(size, 100);
        String currentUserEmail = authentication != null ? authentication.getName() : null;

        Page<LeaderboardEntryDto> leaderboard = leaderboardService.getOrganizationLeaderboard(
                organizationId, timeframe, currentUserEmail, PageRequest.of(page, safeSize));

        return ResponseEntity.ok(ApiResponse.success(leaderboard,
                "Organization leaderboard retrieved successfully."));
    }
}
