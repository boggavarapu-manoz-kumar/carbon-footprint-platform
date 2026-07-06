package com.carbonfootprint.controller;

import com.carbonfootprint.dto.activity.StatisticsDto;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<StatisticsDto>> getDashboardStatistics(
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get dashboard statistics");
        StatisticsDto stats = statisticsService.getDashboardStatistics(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
