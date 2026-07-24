package com.carbonfootprint.repository;

import com.carbonfootprint.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findByGoalIdOrderBySentAtDesc(Long goalId);
    
    @org.springframework.data.jpa.repository.Query("SELECT e FROM EmailLog e WHERE e.status IN :statuses AND (e.nextRetryAt IS NULL OR e.nextRetryAt <= :now) ORDER BY e.sentAt ASC")
    List<EmailLog> findPendingEmails(@org.springframework.data.repository.query.Param("statuses") List<String> statuses, @org.springframework.data.repository.query.Param("now") java.time.LocalDateTime now);

    java.util.Optional<EmailLog> findByTrackingId(String trackingId);
}
