package com.carbonfootprint.dto;

import com.carbonfootprint.entity.NotificationPriority;
import com.carbonfootprint.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDate date;
    private LocalTime time;
    private NotificationPriority priority;
    private String goalName;
    private Long goalId;
    private String goalStatus;
    private boolean isRead;
    private String actionLink;
    private NotificationType notificationType;
    private LocalDateTime createdAt;
}
