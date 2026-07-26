package com.carbonfootprint.controller;

import com.carbonfootprint.dto.benchmarking.BenchmarkingResultDto;
import com.carbonfootprint.service.BenchmarkingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/benchmarking")
@RequiredArgsConstructor
public class BenchmarkingController {

    private final BenchmarkingService benchmarkingService;
    private final com.carbonfootprint.repository.UserRepository userRepository;

    @GetMapping("/compare/monthly")
    public ResponseEntity<BenchmarkingResultDto> getMonthlyComparison(@org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        com.carbonfootprint.entity.User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(benchmarkingService.getMonthlyBenchmarking(user.getId()));
    }

    @GetMapping("/compare/yearly")
    public ResponseEntity<BenchmarkingResultDto> getYearlyComparison(@org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        com.carbonfootprint.entity.User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(benchmarkingService.getYearlyBenchmarking(user.getId()));
    }
    @GetMapping("/dashboard")
    public ResponseEntity<com.carbonfootprint.dto.benchmarking.ComprehensiveBenchmarkDashboardDto> getComprehensiveDashboard(@org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        com.carbonfootprint.entity.User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(benchmarkingService.getComprehensiveBenchmarkingDashboard(user.getId()));
    }
}
