package com.carbonfootprint.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyLeaderboardEntryDto implements Comparable<MonthlyLeaderboardEntryDto> {
    private Long userId;
    private String firstName;
    private String lastName;
    private String username;
    private String profilePictureUrl;
    
    private int rank;
    private Long monthlyScore;
    private BigDecimal carbonSaved;
    private Integer goalsCompleted;
    private Integer activityCount;
    private Integer badgesEarned;
    
    private List<String> awards; // e.g. ["Best Performer", "Most Consistent User"]

    // Detailed breakdown (Enterprise Scoring Engine)
    private Long participationScore;
    private Long goalScore;
    private Long badgeScore;
    private Long carbonReductionScore;
    private Long consistencyScore;
    private Long improvementScore;
    @Override
    public int compareTo(MonthlyLeaderboardEntryDto other) {
        return other.getMonthlyScore().compareTo(this.getMonthlyScore());
    }
}
