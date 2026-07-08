package com.carbonfootprint.repository.admin;

import com.carbonfootprint.entity.admin.AdminNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {
    
    List<AdminNotification> findByAdminUserIdOrAdminUserIdIsNullOrderByTimestampDesc(Long adminUserId);
    
    @Modifying
    @Query("UPDATE AdminNotification n SET n.isRead = true WHERE n.adminUserId = :adminUserId OR n.adminUserId IS NULL")
    void markAllAsRead(Long adminUserId);
}
