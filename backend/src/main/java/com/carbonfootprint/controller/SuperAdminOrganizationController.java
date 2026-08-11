package com.carbonfootprint.controller;

import com.carbonfootprint.dto.organization.OrganizationDto;
import com.carbonfootprint.dto.organization.OrganizationOverviewDto;
import com.carbonfootprint.dto.organization.SuperAdminOrganizationCreateDto;
import com.carbonfootprint.dto.organization.OrganizationInvitationCreateDto;
import com.carbonfootprint.entity.Organization;
import com.carbonfootprint.entity.OrganizationSettings;
import com.carbonfootprint.entity.OrganizationRole;
import com.carbonfootprint.repository.OrganizationRepository;
import com.carbonfootprint.repository.OrganizationSettingsRepository;
import com.carbonfootprint.service.OrganizationInvitationService;
import com.carbonfootprint.service.OrganizationAuditService;
import com.carbonfootprint.service.OrganizationAnalyticsService;
import com.carbonfootprint.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/super-admin/organizations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminOrganizationController {

    private final OrganizationRepository organizationRepository;
    private final OrganizationSettingsRepository organizationSettingsRepository;
    private final OrganizationInvitationService invitationService;
    private final OrganizationAuditService auditService;
    private final OrganizationAnalyticsService analyticsService;

    @PostMapping
    public ResponseEntity<OrganizationDto> createOrganization(@Valid @RequestBody SuperAdminOrganizationCreateDto dto, @AuthenticationPrincipal User adminUser) {
        Organization organization = new Organization();
        organization.setName(dto.getName());
        organization.setOrganizationCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        organization.setIndustry(dto.getIndustry());
        organization.setCompanySize(dto.getCompanySize());
        organization.setCountry(dto.getCountry());
        organization.setTimezone(dto.getTimezone());
        organization.setLogo(dto.getLogo());
        organization.setStatus("ACTIVE");

        organization = organizationRepository.save(organization);

        OrganizationSettings settings = OrganizationSettings.builder()
                .organization(organization)
                .allowEmployeeInvites(false)
                .requireSso(false)
                .build();
        organizationSettingsRepository.save(settings);

        // Provision Organization Admin and dispatch email credentials
        java.util.Map<String, String> adminResult = invitationService.inviteAdmin(organization.getId(), dto.getAdminName(), dto.getAdminEmail());

        auditService.logAction(organization, adminUser, null, "ORGANIZATION_CREATED", "Super Admin created organization " + organization.getName());

        OrganizationDto responseDto = mapToDto(organization);
        responseDto.setAdminEmail(adminResult.get("adminEmail"));
        responseDto.setTempPassword(adminResult.get("tempPassword"));
        responseDto.setInviteLink(adminResult.get("activateUrl"));

        return ResponseEntity.ok(responseDto);
    }

    @GetMapping
    public ResponseEntity<List<OrganizationOverviewDto>> getAllOrganizations() {
        List<OrganizationOverviewDto> orgs = organizationRepository.findAll().stream()
                .map(org -> OrganizationOverviewDto.builder()
                        .id(org.getId())
                        .name(org.getName())
                        .organizationCode(org.getOrganizationCode())
                        .status(org.getStatus())
                        .createdAt(org.getCreatedAt())
                        // member counts would require joins, keeping simple for now
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(orgs);
    }

    @PutMapping("/{id}/suspend")
    public ResponseEntity<?> suspendOrganization(@PathVariable Long id, @AuthenticationPrincipal User adminUser) {
        Organization org = organizationRepository.findById(id).orElseThrow();
        org.setStatus("SUSPENDED");
        organizationRepository.save(org);
        auditService.logAction(org, adminUser, null, "ORGANIZATION_SUSPENDED", "Super Admin suspended organization");
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/reactivate")
    public ResponseEntity<?> reactivateOrganization(@PathVariable Long id, @AuthenticationPrincipal User adminUser) {
        Organization org = organizationRepository.findById(id).orElseThrow();
        org.setStatus("ACTIVE");
        organizationRepository.save(org);
        auditService.logAction(org, adminUser, null, "ORGANIZATION_REACTIVATED", "Super Admin reactivated organization");
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<?> getAnalytics(@PathVariable Long id) {
        // Since this is Super Admin, they can view analytics even without being a member of the organization.
        return ResponseEntity.ok(analyticsService.getOrganizationMetrics(id));
    }

    private OrganizationDto mapToDto(Organization organization) {
        OrganizationDto dto = new OrganizationDto();
        dto.setId(organization.getId());
        dto.setName(organization.getName());
        dto.setOrganizationCode(organization.getOrganizationCode());
        dto.setIndustry(organization.getIndustry());
        dto.setCompanySize(organization.getCompanySize());
        dto.setCountry(organization.getCountry());
        dto.setTimezone(organization.getTimezone());
        dto.setLogo(organization.getLogo());
        dto.setStatus(organization.getStatus());
        dto.setCreatedAt(organization.getCreatedAt());
        dto.setUpdatedAt(organization.getUpdatedAt());
        return dto;
    }
}
