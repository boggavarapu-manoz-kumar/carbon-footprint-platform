package com.carbonfootprint.controller;

import com.carbonfootprint.entity.OrganizationAuditLog;
import com.carbonfootprint.repository.OrganizationAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/organizations/{id}/audit")
@RequiredArgsConstructor
public class OrganizationAuditController {

    private final OrganizationAuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("@orgSecurity.hasPermission(#id, 'AUDIT_VIEW')")
    public ResponseEntity<Page<OrganizationAuditLog>> getAuditLogs(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(auditLogRepository.findByOrganizationId(id, pageable));
    }
}
