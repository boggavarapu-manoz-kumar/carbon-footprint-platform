package com.carbonfootprint.service;

import com.carbonfootprint.entity.Notification;
import com.carbonfootprint.entity.NotificationType;
import com.carbonfootprint.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    
    Notification createNotification(User user, NotificationType type, Long goalId, String goalName, String goalStatus, String currentProgress, String remainingCarbon, String remainingDays, String recommendation, String nextAction, String metaData);
    
    Notification createAchievementNotification(User user, String title, String message, String metaData);
    
    Notification createSupportTicketNotification(User user, String ticketNumber, String status, String metaData);
    
    Page<Notification> getUserNotifications(Long userId, Pageable pageable);
    
    Page<Notification> getUnreadUserNotifications(Long userId, Pageable pageable);
    
    long getUnreadCount(Long userId);
    
    void markAsRead(Long notificationId, Long userId);
    
    void markAllAsRead(Long userId);
}
