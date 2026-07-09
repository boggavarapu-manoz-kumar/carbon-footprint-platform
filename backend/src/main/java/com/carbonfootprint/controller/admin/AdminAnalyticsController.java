package com.carbonfootprint.controller.admin;

import com.carbonfootprint.dto.admin.*;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.admin.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ANALYTICS_VIEW)")
public class AdminAnalyticsController {

    private final AdminAnalyticsService analyticsService;

    // ─── Platform Summary ────────────────────────────────────────
    @GetMapping("/platform")
    public ResponseEntity<ApiResponse<PlatformAnalyticsResponse>> getPlatformAnalytics() {
        log.info("Fetching platform-wide analytics summary");
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getPlatformAnalytics(), "Platform analytics retrieved"));
    }

    // ─── User Growth ─────────────────────────────────────────────
    @GetMapping("/users/growth")
    public ResponseEntity<ApiResponse<List<UserGrowthResponse>>> getUserGrowth(
            @RequestParam(defaultValue = "30") int days) {
        log.info("Fetching user growth analytics for {} days", days);
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getUserGrowth(days), "User growth retrieved"));
    }

    // ─── User Demographics ───────────────────────────────────────
    @GetMapping("/users/demographics")
    public ResponseEntity<ApiResponse<List<UserDemographicsResponse>>> getUserDemographics() {
        log.info("Fetching user demographics");
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getUserDemographics(), "User demographics retrieved"));
    }

    // ─── User Monthly Registration ───────────────────────────────
    @GetMapping("/users/monthly")
    public ResponseEntity<ApiResponse<List<UserGrowthResponse>>> getUserMonthlyGrowth(
            @RequestParam(defaultValue = "#{T(java.time.Year).now().getValue()}") int year) {
        log.info("Fetching user monthly growth for year {}", year);
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getUserMonthlyGrowth(year), "Monthly user growth retrieved"));
    }

    // ─── Activity Trends ─────────────────────────────────────────
    @GetMapping("/activities/trends")
    public ResponseEntity<ApiResponse<List<ActivityTrendResponse>>> getActivityTrends(
            @RequestParam(defaultValue = "30") int days) {
        log.info("Fetching activity trends for {} days", days);
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getActivityTrends(days), "Activity trends retrieved"));
    }

    // ─── Category Analytics ──────────────────────────────────────
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryAnalyticsResponse>>> getCategoryAnalytics() {
        log.info("Fetching category analytics");
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getCategoryAnalytics(), "Category analytics retrieved"));
    }

    // ─── Carbon Trends (Daily) ────────────────────────────────────
    @GetMapping("/carbon/trends")
    public ResponseEntity<ApiResponse<List<CarbonTrendResponse>>> getCarbonTrends(
            @RequestParam(defaultValue = "30") int days) {
        log.info("Fetching carbon trends for {} days", days);
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getCarbonTrends(days), "Carbon trends retrieved"));
    }

    // ─── Carbon Trends (Monthly) ──────────────────────────────────
    @GetMapping("/carbon/monthly")
    public ResponseEntity<ApiResponse<List<CarbonTrendResponse>>> getCarbonMonthlyTrends(
            @RequestParam(defaultValue = "#{T(java.time.Year).now().getValue()}") int year) {
        log.info("Fetching carbon monthly trends for year {}", year);
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getCarbonMonthlyTrends(year), "Carbon monthly trends retrieved"));
    }

    // ─── Activity Analytics (Detailed by Category) ───────────────
    @GetMapping("/activities/details")
    public ResponseEntity<ApiResponse<List<ActivityAnalyticsResponse>>> getActivityAnalytics() {
        log.info("Fetching detailed activity analytics");
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getActivityAnalytics(), "Activity analytics retrieved"));
    }

    // ─── Leaderboard Analytics ───────────────────────────────────
    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardAnalyticsResponse>>> getLeaderboardAnalytics(
            @RequestParam(defaultValue = "20") int limit) {
        log.info("Fetching leaderboard analytics top {}", limit);
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getLeaderboardAnalytics(limit), "Leaderboard analytics retrieved"));
    }

    // ─── Trend Comparison (Month-over-Month) ─────────────────────
    @GetMapping("/trends/comparison")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTrendComparison() {
        log.info("Fetching trend comparison analytics");
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getTrendComparison(), "Trend comparison retrieved"));
    }

    // ─── Daily Platform Analytics ─────────────────────────────────
    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<DailyAnalyticsResponse>> getDailyAnalytics() {
        log.info("Fetching daily platform analytics");
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDailyAnalytics(), "Daily analytics retrieved"));
    }

    // ─── Weekly Platform Analytics ─────────────────────────────────
    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<WeeklyAnalyticsResponse>> getWeeklyAnalytics() {
        log.info("Fetching weekly platform analytics");
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getWeeklyAnalytics(), "Weekly analytics retrieved"));
    }
}
