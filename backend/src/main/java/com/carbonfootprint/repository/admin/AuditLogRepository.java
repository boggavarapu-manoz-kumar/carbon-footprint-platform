package com.carbonfootprint.repository.admin;

import com.carbonfootprint.entity.admin.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "LOWER(a.actor) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.ipAddress) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(CAST(a.id AS string)) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<AuditLog> searchAuditLogs(@Param("search") String search, Pageable pageable);
}
