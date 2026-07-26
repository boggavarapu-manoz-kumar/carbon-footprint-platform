package com.carbonfootprint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPointsResponseDto {
    private Long userId;
    private Long totalPoints;
    private String currentLevel;
    private Integer currentStreak;
    private Integer longestStreak;
    private List<PointHistoryDto> history;
}
