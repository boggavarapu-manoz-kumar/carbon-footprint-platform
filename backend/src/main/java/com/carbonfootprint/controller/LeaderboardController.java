package com.carbonfootprint.controller;

import com.carbonfootprint.dto.leaderboard.LeaderboardResponseDto;
import com.carbonfootprint.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<LeaderboardResponseDto> getLeaderboard(
            @AuthenticationPrincipal UserDetails userDetails,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String category,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String sortBy) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(leaderboardService.getLeaderboard(email, category, sortBy));
    }

    @GetMapping("/user-stats")
    public ResponseEntity<com.carbonfootprint.dto.leaderboard.UserLeaderboardStatsDto> getUserStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(leaderboardService.getUserLeaderboardStats(email));
    }

    @GetMapping("/weekly")
    public ResponseEntity<com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardResponseDto> getWeeklyLeaderboard(
            @AuthenticationPrincipal UserDetails userDetails,
            @org.springframework.web.bind.annotation.RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate weekStart,
            @org.springframework.web.bind.annotation.RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate weekEnd,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String category,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String sortBy) {
        
        String email = userDetails != null ? userDetails.getUsername() : null;
        
        if (weekStart == null || weekEnd == null) {
            java.time.LocalDate today = java.time.LocalDate.now();
            weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
            weekEnd = today;
        }
        
        com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardResponseDto response = leaderboardService.getWeeklyLeaderboard(email, weekStart, weekEnd, category, sortBy);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/weekly/history")
    public ResponseEntity<java.util.List<com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardEntryDto>> getWeeklyLeaderboardHistory(
            @org.springframework.web.bind.annotation.RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate weekStart,
            @org.springframework.web.bind.annotation.RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate weekEnd) {
        
        java.util.List<com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardEntryDto> response = leaderboardService.getWeeklyLeaderboardHistory(weekStart, weekEnd);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/monthly")
    public ResponseEntity<com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardResponseDto> getMonthlyLeaderboard(
            @AuthenticationPrincipal UserDetails userDetails,
            @org.springframework.web.bind.annotation.RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate monthStart,
            @org.springframework.web.bind.annotation.RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate monthEnd,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String category,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String sortBy) {
        
        String email = userDetails != null ? userDetails.getUsername() : null;
        
        if (monthStart == null || monthEnd == null) {
            java.time.LocalDate today = java.time.LocalDate.now();
            monthStart = today.withDayOfMonth(1);
            monthEnd = today.withDayOfMonth(today.lengthOfMonth());
        }
        
        com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardResponseDto response = leaderboardService.getMonthlyLeaderboard(email, monthStart, monthEnd, category, sortBy);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/monthly/history")
    public ResponseEntity<java.util.List<com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardEntryDto>> getMonthlyLeaderboardHistory(
            @org.springframework.web.bind.annotation.RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate monthStart,
            @org.springframework.web.bind.annotation.RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate monthEnd) {
        
        java.util.List<com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardEntryDto> response = leaderboardService.getMonthlyLeaderboardHistory(monthStart, monthEnd);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/yearly")
    public ResponseEntity<com.carbonfootprint.dto.leaderboard.YearlyLeaderboardResponseDto> getYearlyLeaderboard(
            @AuthenticationPrincipal UserDetails userDetails,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Integer year,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String category,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String sortBy) {
        
        String email = userDetails != null ? userDetails.getUsername() : null;
        
        if (year == null) {
            year = java.time.LocalDate.now().getYear();
        }
        
        com.carbonfootprint.dto.leaderboard.YearlyLeaderboardResponseDto response = leaderboardService.getYearlyLeaderboard(email, year, category, sortBy);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/yearly/history")
    public ResponseEntity<java.util.List<com.carbonfootprint.dto.leaderboard.YearlyLeaderboardEntryDto>> getYearlyLeaderboardHistory(
            @org.springframework.web.bind.annotation.RequestParam Integer year) {
        
        java.util.List<com.carbonfootprint.dto.leaderboard.YearlyLeaderboardEntryDto> response = leaderboardService.getYearlyLeaderboardHistory(year);
        return ResponseEntity.ok(response);
    }
}
