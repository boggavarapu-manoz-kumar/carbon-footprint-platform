package com.carbonfootprint.controller.admin;

import com.carbonfootprint.dto.admin.benchmarking.AdminBenchmarkingDistributionDto;
import com.carbonfootprint.dto.admin.benchmarking.AdminBenchmarkingSummaryDto;
import com.carbonfootprint.dto.benchmarking.TrendDataPointDto;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.admin.AdminBenchmarkingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/benchmarking")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'AUDITOR')")
public class AdminBenchmarkingController {

    private final AdminBenchmarkingService adminBenchmarkingService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AdminBenchmarkingSummaryDto>> getSummary(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        log.info("REST request to get Admin Benchmarking Summary");
        AdminBenchmarkingSummaryDto summary = adminBenchmarkingService.getPlatformBenchmarkingSummary(year, month);
        return ResponseEntity.ok(ApiResponse.success(summary, "Benchmarking summary retrieved"));
    }

    @GetMapping("/distribution")
    public ResponseEntity<ApiResponse<AdminBenchmarkingDistributionDto>> getDistribution(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        log.info("REST request to get Admin Benchmarking Distribution");
        AdminBenchmarkingDistributionDto distribution = adminBenchmarkingService.getPlatformBenchmarkingDistribution(year, month);
        return ResponseEntity.ok(ApiResponse.success(distribution, "Benchmarking distribution retrieved"));
    }

    @GetMapping("/trends")
    public ResponseEntity<ApiResponse<List<TrendDataPointDto>>> getTrends(
            @RequestParam(required = false) Integer year) {
        log.info("REST request to get Admin Benchmarking Trends");
        List<TrendDataPointDto> trends = adminBenchmarkingService.getPlatformBenchmarkingTrends(year);
        return ResponseEntity.ok(ApiResponse.success(trends, "Benchmarking trends retrieved"));
    }
}
