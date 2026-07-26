package com.carbonfootprint.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeShowcaseDto {
    private List<BadgeDetailDto> earnedBadges;
    private List<BadgeDetailDto> lockedBadges;
    private List<BadgeDetailDto> upcomingBadges; // >50% progress
    private List<BadgeDetailDto> rareBadges;
    private List<BadgeDetailDto> legendaryBadges;
}
