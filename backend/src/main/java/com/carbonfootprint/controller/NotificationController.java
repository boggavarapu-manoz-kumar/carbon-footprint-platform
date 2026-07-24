package com.carbonfootprint.controller;

import com.carbonfootprint.dto.NotificationDTO;
import com.carbonfootprint.entity.Notification;
import com.carbonfootprint.dto.UserDto;
import com.carbonfootprint.service.NotificationService;
import com.carbonfootprint.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> getNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        UserDto user = userService.getUserByEmail(authentication.getName());
        Page<Notification> notifications;
        
        if (unreadOnly) {
            notifications = notificationService.getUnreadUserNotifications(user.getId(), pageable);
        } else {
            notifications = notificationService.getUserNotifications(user.getId(), pageable);
        }
        
        return ResponseEntity.ok(notifications.map(this::convertToDTO));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        UserDto user = userService.getUserByEmail(authentication.getName());
        long count = notificationService.getUnreadCount(user.getId());
        
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        UserDto user = userService.getUserByEmail(authentication.getName());
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        UserDto user = userService.getUserByEmail(authentication.getName());
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }

    private NotificationDTO convertToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .description(notification.getDescription())
                .date(notification.getDate())
                .time(notification.getTime())
                .priority(notification.getPriority())
                .goalName(notification.getGoalName())
                .goalId(notification.getGoalId())
                .goalStatus(notification.getGoalStatus())
                .isRead(notification.isRead())
                .actionLink(notification.getActionLink())
                .notificationType(notification.getNotificationType())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
