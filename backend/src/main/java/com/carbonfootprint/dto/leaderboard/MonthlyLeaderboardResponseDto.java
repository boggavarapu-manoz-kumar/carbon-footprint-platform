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
public class MonthlyLeaderboardResponseDto {
    private List<MonthlyLeaderboardEntryDto> topUsers;
    private MonthlyLeaderboardEntryDto currentUser;
    private int totalUsers;
    private LocalDate monthStartDate;
    private LocalDate monthEndDate;
}
