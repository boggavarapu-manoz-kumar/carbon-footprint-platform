package com.carbonfootprint.repository;

import com.carbonfootprint.entity.OrganizationAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizationAuditLogRepository extends JpaRepository<OrganizationAuditLog, Long> {
    Page<OrganizationAuditLog> findByOrganizationId(Long organizationId, Pageable pageable);
}
