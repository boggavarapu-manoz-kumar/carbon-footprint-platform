package com.carbonfootprint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineEventDto {
    private String id;
    private String title;
    private String description;
    private LocalDateTime timestamp;
    private String type; // e.g., ACCOUNT, ACTIVITY, GOAL, BADGE
    private String iconName;
    private String color;
}
