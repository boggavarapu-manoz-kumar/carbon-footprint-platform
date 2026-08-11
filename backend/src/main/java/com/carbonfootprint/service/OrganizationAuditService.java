package com.carbonfootprint.service;

import com.carbonfootprint.entity.Organization;
import com.carbonfootprint.entity.OrganizationAuditLog;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.OrganizationAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrganizationAuditService {

    private final OrganizationAuditLogRepository auditLogRepository;

    @Async
    public void logAction(Organization organization, User actor, User targetUser, String action, String details) {
        OrganizationAuditLog log = OrganizationAuditLog.builder()
                .organization(organization)
                .actor(actor)
                .targetUser(targetUser)
                .action(action)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }
}
