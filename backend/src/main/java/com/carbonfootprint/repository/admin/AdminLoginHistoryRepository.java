package com.carbonfootprint.repository.admin;

import com.carbonfootprint.entity.admin.AdminLoginHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AdminLoginHistoryRepository extends JpaRepository<AdminLoginHistory, Long> {
    long countByEmailAttemptedAndStatusAndCreatedAtAfter(String emailAttempted, String status, LocalDateTime createdAtAfter);
}
