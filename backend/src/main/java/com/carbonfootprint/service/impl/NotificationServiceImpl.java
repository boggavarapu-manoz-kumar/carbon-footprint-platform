package com.carbonfootprint.service.impl;

import com.carbonfootprint.entity.Notification;
import com.carbonfootprint.entity.NotificationPriority;
import com.carbonfootprint.entity.NotificationType;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.NotificationRepository;
import com.carbonfootprint.service.EmailService;
import com.carbonfootprint.service.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public Notification createNotification(User user, NotificationType type, Long goalId, String goalName, String goalStatus, String currentProgress, String remainingCarbon, String remainingDays, String recommendation, String nextAction, String metaData) {
        
        // Deduplication Logic: Prevent exact same notification type for the same goal within the last 1 hour
        boolean exists = notificationRepository.existsByUserIdAndGoalIdAndNotificationTypeAndCreatedAtAfter(
                user.getId(), goalId, type, LocalDateTime.now().minusHours(1));
                
        if (exists) {
            log.info("Duplicate notification prevented for user: {}, goal: {}, type: {}", user.getId(), goalId, type);
            return null;
        }

        NotificationPriority priority = determinePriority(type);
        String title = determineTitle(type, goalName);
        String description = determineDescription(type, goalName, currentProgress);
        
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .description(description)
                .date(LocalDate.now())
                .time(LocalTime.now())
                .priority(priority)
                .goalName(goalName)
                .goalId(goalId)
                .goalStatus(goalStatus)
                .actionLink("/dashboard/goals/" + goalId)
                .notificationType(type)
                .metaData(metaData)
                .build();
                
        Notification saved = notificationRepository.save(notification);
        
        // Trigger Email Notification for types that don't have dedicated email templates
        if (type == NotificationType.GOAL_CREATED) {
            try {
                Map<String, Object> emailData = new HashMap<>();
                emailData.put("userName", user.getFirstName());
                emailData.put("goalName", goalName);
                emailData.put("targetEmissions", remainingCarbon);
                emailData.put("targetDate", LocalDate.now().plusDays(Long.parseLong(remainingDays.replace(" days", ""))).toString());
                emailData.put("actionLink", notification.getActionLink());
                
                emailService.sendGoalCreatedEmail(user.getEmail(), title, emailData);
            } catch (Exception e) {
                log.error("Failed to send goal created email to {}", user.getEmail(), e);
            }
        } else if (type != NotificationType.GOAL_COMPLETED && type != NotificationType.GOAL_FAILED) {
            try {
                Map<String, Object> emailData = new HashMap<>();
                emailData.put("userName", user.getFirstName());
                emailData.put("goalName", goalName);
                emailData.put("currentProgress", currentProgress);
                emailData.put("remainingCarbon", remainingCarbon);
                emailData.put("remainingDays", remainingDays);
                emailData.put("recommendation", recommendation);
                emailData.put("nextAction", nextAction);
                emailData.put("title", title);
                emailData.put("description", description);
                emailData.put("priority", priority.name());
                emailData.put("actionLink", notification.getActionLink());
                
                emailService.sendGoalNotificationEmail(user.getEmail(), title, emailData);
            } catch (Exception e) {
                log.error("Failed to send notification email to {}", user.getEmail(), e);
            }
        }

        return saved;
    }
    
    @Override
    @Transactional
    public Notification createAchievementNotification(User user, String title, String message, String metaData) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .description(message)
                .date(LocalDate.now())
                .time(LocalTime.now())
                .priority(NotificationPriority.ACHIEVEMENT)
                .actionLink("/dashboard")
                .notificationType(NotificationType.ACHIEVEMENT_UNLOCKED)
                .metaData(metaData)
                .build();
                
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public Notification createSupportTicketNotification(User user, String ticketNumber, String status, String metaData) {
        Notification notification = Notification.builder()
                .user(user)
                .title("Support Ticket " + status)
                .description("Your ticket " + ticketNumber + " has been " + status.toLowerCase() + ".")
                .date(LocalDate.now())
                .time(LocalTime.now())
                .priority(NotificationPriority.INFO)
                .actionLink("/dashboard/support")
                .notificationType(NotificationType.SUPPORT_TICKET_CREATED)
                .metaData(metaData)
                .build();
                
        return notificationRepository.save(notification);
    }

    private NotificationPriority determinePriority(NotificationType type) {
        switch (type) {
            case GOAL_CREATED:
            case GOAL_STARTED:
            case GOAL_RESUMED:
            case GOAL_EXTENDED:
            case GOAL_UPDATED:
                return NotificationPriority.INFO;
            case WEEKLY_PROGRESS:
            case MONTHLY_PROGRESS:
            case GOAL_REMINDER:
                return NotificationPriority.REMINDER;
            case GOAL_COMPLETED:
                return NotificationPriority.ACHIEVEMENT;
            case GOAL_FAILED:
            case GOAL_CANCELLED:
            case GOAL_DELETED:
                return NotificationPriority.FAILURE;
            case GOAL_NEAR_DEADLINE:
                return NotificationPriority.WARNING;
            default:
                return NotificationPriority.INFO;
        }
    }

    private String determineTitle(NotificationType type, String goalName) {
        switch (type) {
            case GOAL_CREATED: return "New Goal Created";
            case GOAL_STARTED: return "Goal Started: " + goalName;
            case WEEKLY_PROGRESS: return "Weekly Progress Update";
            case MONTHLY_PROGRESS: return "Monthly Progress Update";
            case GOAL_COMPLETED: return "Goal Achieved!";
            case GOAL_NEAR_DEADLINE: return "Goal Deadline Approaching";
            case GOAL_FAILED: return "Goal Failed";
            case GOAL_REMINDER: return "Goal Reminder";
            case GOAL_PAUSED: return "Goal Paused";
            case GOAL_RESUMED: return "Goal Resumed";
            case GOAL_EXTENDED: return "Goal Deadline Extended";
            case GOAL_CANCELLED: return "Goal Cancelled";
            case GOAL_DELETED: return "Goal Deleted";
            case GOAL_UPDATED: return "Goal Updated";
            default: return "Goal Notification";
        }
    }

    private String determineDescription(NotificationType type, String goalName, String currentProgress) {
        // Detailed descriptions can be tailored more based on progress later
        return "You have a new update regarding your goal: " + goalName + ". Current Progress: " + currentProgress;
    }

    @Override
    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Override
    public Page<Notification> getUnreadUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false, pageable);
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (notification.getUser().getId().equals(userId)) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        });
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }
}
