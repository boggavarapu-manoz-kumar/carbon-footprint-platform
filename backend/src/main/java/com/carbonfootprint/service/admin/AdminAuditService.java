package com.carbonfootprint.service.admin;

import com.carbonfootprint.entity.admin.AuditLog;
import com.carbonfootprint.repository.admin.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminAuditService {

    private final AuditLogRepository auditLogRepository;

    public Page<AuditLog> getAuditLogs(String search, Pageable pageable) {
        if (StringUtils.hasText(search)) {
            return auditLogRepository.searchAuditLogs(search, pageable);
        }
        return auditLogRepository.findAll(pageable);
    }
}
