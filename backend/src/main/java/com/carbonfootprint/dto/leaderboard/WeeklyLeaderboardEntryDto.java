package com.carbonfootprint.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyLeaderboardEntryDto implements Comparable<WeeklyLeaderboardEntryDto> {
    private Long userId;
    private String firstName;
    private String lastName;
    private String username;
    private String profilePictureUrl;
    
    private int rank;
    private Long weeklyScore;
    private BigDecimal carbonSaved;
    private Integer badgesEarned;
    private String trend; // "UP", "DOWN", "STABLE"
    
    // Detailed breakdown (Enterprise Scoring Engine)
    private Long participationScore;
    private Long goalScore;
    private Long badgeScore;
    private Long carbonReductionScore;
    private Long consistencyScore;
    private Long improvementScore;
    @Override
    public int compareTo(WeeklyLeaderboardEntryDto other) {
        return other.getWeeklyScore().compareTo(this.getWeeklyScore());
    }
}
