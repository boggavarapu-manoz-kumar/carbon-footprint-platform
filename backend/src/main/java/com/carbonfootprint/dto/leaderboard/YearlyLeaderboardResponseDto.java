package com.carbonfootprint.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YearlyLeaderboardResponseDto {
    private List<YearlyLeaderboardEntryDto> topUsers;
    private YearlyLeaderboardEntryDto currentUser;
    private int totalUsers;
    private int year;
}
