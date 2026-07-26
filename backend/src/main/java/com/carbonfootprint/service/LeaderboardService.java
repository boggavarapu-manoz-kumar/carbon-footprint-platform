package com.carbonfootprint.service;

import com.carbonfootprint.dto.leaderboard.LeaderboardResponseDto;
import com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardResponseDto;

import java.time.LocalDate;

public interface LeaderboardService {
    LeaderboardResponseDto getLeaderboard(String currentUserEmail, String category, String sortBy);
    
    WeeklyLeaderboardResponseDto getWeeklyLeaderboard(String currentUserEmail, LocalDate weekStart, LocalDate weekEnd, String category, String sortBy);
    
    java.util.List<com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardEntryDto> getWeeklyLeaderboardHistory(LocalDate weekStart, LocalDate weekEnd);
    
    com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardResponseDto getMonthlyLeaderboard(String currentUserEmail, LocalDate monthStart, LocalDate monthEnd, String category, String sortBy);
    
    java.util.List<com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardEntryDto> getMonthlyLeaderboardHistory(LocalDate monthStart, LocalDate monthEnd);
    
    com.carbonfootprint.dto.leaderboard.YearlyLeaderboardResponseDto getYearlyLeaderboard(String currentUserEmail, int year, String category, String sortBy);
    
    java.util.List<com.carbonfootprint.dto.leaderboard.YearlyLeaderboardEntryDto> getYearlyLeaderboardHistory(int year);
    
    // Optional: a method to recalculate or clear cache if needed manually
    void evictLeaderboardCache();
    
    com.carbonfootprint.dto.leaderboard.UserLeaderboardStatsDto getUserLeaderboardStats(String currentUserEmail);
}
