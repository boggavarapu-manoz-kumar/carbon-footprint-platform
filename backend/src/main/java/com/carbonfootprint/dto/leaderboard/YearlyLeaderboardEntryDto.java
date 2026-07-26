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
public class YearlyLeaderboardEntryDto implements Comparable<YearlyLeaderboardEntryDto> {
    private Long userId;
    private String firstName;
    private String lastName;
    private String username;
    private String profilePictureUrl;
    
    private int rank;
    private Long yearlyScore;
    private BigDecimal carbonSaved;
    private Integer goalsCompleted;
    private Long badgePoints;
    
    private String award; // e.g., "Gold", "Silver", "Bronze", "Top 10", "Top 100"

    // Detailed breakdown (Enterprise Scoring Engine)
    private Long participationScore;
    private Long goalScore;
    private Long badgeScore;
    private Long carbonReductionScore;
    private Long consistencyScore;
    private Long improvementScore;
    @Override
    public int compareTo(YearlyLeaderboardEntryDto other) {
        return other.getYearlyScore().compareTo(this.getYearlyScore());
    }
}
