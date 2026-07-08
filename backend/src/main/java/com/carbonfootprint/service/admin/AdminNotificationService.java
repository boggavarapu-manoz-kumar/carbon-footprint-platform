package com.carbonfootprint.service.admin;

import com.carbonfootprint.entity.admin.AdminNotification;
import com.carbonfootprint.repository.admin.AdminNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminNotificationService {

    private final AdminNotificationRepository adminNotificationRepository;

    public List<AdminNotification> getNotificationsForAdmin(Long adminId) {
        return adminNotificationRepository.findByAdminUserIdOrAdminUserIdIsNullOrderByTimestampDesc(adminId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        AdminNotification notification = adminNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        adminNotificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long adminId) {
        adminNotificationRepository.markAllAsRead(adminId);
    }

    public void createNotification(String title, String message, String type, String priority, Long adminId) {
        AdminNotification notification = AdminNotification.builder()
                .title(title)
                .message(message)
                .type(type)
                .priority(priority)
                .isRead(false)
                .adminUserId(adminId)
                .build();
        adminNotificationRepository.save(notification);
    }
}
