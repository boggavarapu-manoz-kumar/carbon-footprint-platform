package com.carbonfootprint.repository;

import com.carbonfootprint.entity.Notification;
import com.carbonfootprint.entity.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(Long userId, boolean isRead, Pageable pageable);
    
    long countByUserIdAndIsReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId")
    void markAllAsReadByUserId(@Param("userId") Long userId);
    
    // For deduplication: check if a notification of the same type for the same goal was created recently
    boolean existsByUserIdAndGoalIdAndNotificationTypeAndCreatedAtAfter(
            Long userId, Long goalId, NotificationType type, LocalDateTime afterTime);

    java.util.List<Notification> findByGoalIdOrderByCreatedAtDesc(Long goalId);
}
