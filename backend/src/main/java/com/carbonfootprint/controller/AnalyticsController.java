package com.carbonfootprint.controller;

import com.carbonfootprint.dto.analytics.AnalyticsResponseDto;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Slf4j
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<AnalyticsResponseDto>> getDailyAnalytics(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String category) {
        
        if (date == null) date = LocalDate.now();
        log.info("REST request to get daily analytics for user: {}", authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDailyAnalytics(authentication.getName(), date, category)));
    }

    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<AnalyticsResponseDto>> getWeeklyAnalytics(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String category) {
        
        if (date == null) date = LocalDate.now();
        log.info("REST request to get weekly analytics for user: {}", authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getWeeklyAnalytics(authentication.getName(), date, category)));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<AnalyticsResponseDto>> getMonthlyAnalytics(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String category) {
        
        if (date == null) date = LocalDate.now();
        log.info("REST request to get monthly analytics for user: {}", authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getMonthlyAnalytics(authentication.getName(), date, category)));
    }

    @GetMapping("/yearly")
    public ResponseEntity<ApiResponse<AnalyticsResponseDto>> getYearlyAnalytics(
            Authentication authentication,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String category) {
        
        if (year == null) year = LocalDate.now().getYear();
        log.info("REST request to get yearly analytics for user: {}", authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getYearlyAnalytics(authentication.getName(), year, category)));
    }

    @GetMapping("/years")
    public ResponseEntity<ApiResponse<List<Integer>>> getAvailableYears(Authentication authentication) {
        log.info("REST request to get available years for analytics");
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getAvailableYears(authentication.getName())));
    }
}
