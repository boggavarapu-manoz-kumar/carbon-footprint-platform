package com.carbonfootprint.controller;

import com.carbonfootprint.dto.leaderboard.LeaderboardResponseDto;
import com.carbonfootprint.service.OrganizationLeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/organizations/{id}/leaderboard")
@RequiredArgsConstructor
public class OrganizationLeaderboardController {

    private final OrganizationLeaderboardService organizationLeaderboardService;

    @GetMapping
    @PreAuthorize("@orgSecurity.hasPermission(#id, 'ORGANIZATION_VIEW')")
    public ResponseEntity<LeaderboardResponseDto> getOrganizationLeaderboard(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(organizationLeaderboardService.getOrganizationLeaderboard(id, email));
    }
}
