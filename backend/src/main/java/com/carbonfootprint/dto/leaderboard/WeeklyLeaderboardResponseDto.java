package com.carbonfootprint.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyLeaderboardResponseDto {
    private List<WeeklyLeaderboardEntryDto> topUsers;
    private WeeklyLeaderboardEntryDto currentUser;
    private int totalUsers;
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
}
