package com.carbonfootprint.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDetailDto {
    private Long id;
    private String name;
    private String description;
    private String category;
    private Integer points;
    private String difficulty; 
    private String iconName; 
    private String imagePath;
    
    // Progress specific fields
    private boolean isEarned;
    private LocalDateTime earnedAt;
    
    // Locked/Upcoming fields
    private String ruleType;
    private Integer currentProgress;
    private Integer targetProgress;
    private String criteria; 
}
