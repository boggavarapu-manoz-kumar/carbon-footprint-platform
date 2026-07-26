package com.carbonfootprint.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLeaderboardStatsDto {
    private Integer currentRank;
    private Integer previousRank;
    private Integer bestRank;
    private Long currentScore;
    private Long weeklyScore;
    private Long monthlyScore;
    private Long yearlyScore;
    private String trend; // "IMPROVED", "DROPPED", "UNCHANGED"
}
