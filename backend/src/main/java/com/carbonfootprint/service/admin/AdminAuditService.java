package com.carbonfootprint.service.admin;

import com.carbonfootprint.entity.admin.AuditLog;
import com.carbonfootprint.repository.admin.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuditService {

    private final AuditLogRepository auditLogRepository;

    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }
}
