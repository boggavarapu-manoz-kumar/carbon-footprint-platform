package com.carbonfootprint.controller;

import com.carbonfootprint.dto.organization.OrganizationCreateDto;
import com.carbonfootprint.dto.organization.OrganizationDto;
import com.carbonfootprint.dto.organization.OrganizationInvitationCreateDto;
import com.carbonfootprint.dto.organization.OrganizationOverviewDto;
import com.carbonfootprint.entity.Organization;
import com.carbonfootprint.entity.OrganizationMember;
import com.carbonfootprint.entity.OrganizationRole;
import com.carbonfootprint.entity.OrganizationSettings;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.OrganizationMemberRepository;
import com.carbonfootprint.repository.OrganizationRepository;
import com.carbonfootprint.repository.OrganizationSettingsRepository;
import com.carbonfootprint.repository.OrganizationInvitationRepository;
import com.carbonfootprint.service.OrganizationInvitationService;
import com.carbonfootprint.service.OrganizationMemberService;
import com.carbonfootprint.service.OrganizationAnalyticsService;
import com.carbonfootprint.service.OrganizationAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationSettingsRepository organizationSettingsRepository;
    private final OrganizationInvitationRepository organizationInvitationRepository;
    private final OrganizationInvitationService invitationService;
    private final OrganizationMemberService memberService;
    private final OrganizationAnalyticsService analyticsService;
    private final OrganizationAuditService auditService;

    @PostMapping
    @Transactional
    public ResponseEntity<OrganizationDto> createOrganization(
            @RequestBody OrganizationCreateDto dto,
            @AuthenticationPrincipal User user) {

        if (organizationRepository.existsByName(dto.getName())) {
            return ResponseEntity.badRequest().build();
        }

        Organization organization = Organization.builder()
                .name(dto.getName())
                .organizationCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .industry(dto.getIndustry())
                .companySize(dto.getCompanySize())
                .country(dto.getCountry())
                .timezone(dto.getTimezone())
                .build();

        organization = organizationRepository.save(organization);

        OrganizationMember member = OrganizationMember.builder()
                .organization(organization)
                .user(user)
                .role(OrganizationRole.ORGANIZATION_OWNER)
                .status("ACTIVE")
                .build();

        organizationMemberRepository.save(member);

        OrganizationSettings settings = OrganizationSettings.builder()
                .organization(organization)
                .allowEmployeeInvites(false)
                .requireSso(false)
                .build();
        organizationSettingsRepository.save(settings);

        return ResponseEntity.ok(mapToDto(organization));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@orgSecurity.hasPermission(#id, 'ORGANIZATION_VIEW')")
    public ResponseEntity<OrganizationDto> getOrganization(@PathVariable Long id) {
        return organizationRepository.findById(id)
                .map(this::mapToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrganizationDto>> getMyOrganizations(@AuthenticationPrincipal User user) {
        List<OrganizationDto> orgs = organizationMemberRepository.findByUserId(user.getId())
                .stream()
                .filter(m -> "ACTIVE".equals(m.getStatus()))
                .map(m -> mapToDto(m.getOrganization()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(orgs);
    }

    @GetMapping("/{id}/overview")
    @PreAuthorize("@orgSecurity.hasPermission(#id, 'ORGANIZATION_VIEW')")
    public ResponseEntity<OrganizationOverviewDto> getOrganizationOverview(@PathVariable Long id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new com.carbonfootprint.exception.ResourceNotFoundException("Organization not found"));

        long totalMembers = organizationMemberRepository.countByOrganizationId(id);
        long activeMembers = organizationMemberRepository.countByOrganizationIdAndStatus(id, "ACTIVE");
        long pendingInvites = organizationInvitationRepository.countByOrganizationIdAndStatus(id, "PENDING");
        
        OrganizationSettings settings = organizationSettingsRepository.findByOrganizationId(id)
                .orElse(null);
                
        int progress = 0;
        if (org.getLogo() != null) progress += 33;
        if (activeMembers > 1) progress += 34;
        if (settings != null && settings.isRequireSso()) progress += 33;
        if (progress == 0) progress = 10; // Base progress for just creating it

        OrganizationOverviewDto dto = OrganizationOverviewDto.builder()
                .id(org.getId())
                .name(org.getName())
                .organizationCode(org.getOrganizationCode())
                .status(org.getStatus())
                .createdAt(org.getCreatedAt())
                .memberCount(totalMembers)
                .activeMembers(activeMembers)
                .pendingInvitations(pendingInvites)
                .setupProgress(progress)
                .build();

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/invitations")
    @PreAuthorize("@orgSecurity.hasPermission(#id, 'MEMBERS_INVITE')")
    public ResponseEntity<?> inviteMember(@PathVariable Long id, @RequestBody OrganizationInvitationCreateDto dto, @AuthenticationPrincipal User user) {
        invitationService.inviteMember(id, dto);
        auditService.logAction(organizationRepository.findById(id).orElseThrow(), user, null, "MEMBER_INVITED", "Invited " + dto.getEmail() + " as " + dto.getRole());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/invitations/bulk")
    @PreAuthorize("@orgSecurity.hasPermission(#id, 'MEMBERS_INVITE')")
    public ResponseEntity<?> bulkInviteMembers(
            @PathVariable Long id,
            @RequestBody List<OrganizationInvitationCreateDto> dtos,
            @AuthenticationPrincipal User user) {
        invitationService.bulkInviteMembers(id, dtos);
        auditService.logAction(organizationRepository.findById(id).orElseThrow(), user, null, "BULK_INVITE", "Bulk invited " + dtos.size() + " members");
        return ResponseEntity.ok().build();
    }

    @PostMapping("/invitations/{token}/accept")
    public ResponseEntity<?> acceptInvitation(@PathVariable String token, @AuthenticationPrincipal User user) {
        invitationService.acceptInvitation(token, user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/invitations/{invitationId}/revoke")
    @PreAuthorize("@orgSecurity.hasPermission(#id, 'MEMBERS_INVITE')")
    public ResponseEntity<?> revokeInvitation(
            @PathVariable Long id,
            @PathVariable Long invitationId) {
        invitationService.revokeInvitation(id, invitationId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/invitations/{invitationId}/resend")
    @PreAuthorize("@orgSecurity.hasPermission(#id, 'MEMBERS_INVITE')")
    public ResponseEntity<?> resendInvitation(
            @PathVariable Long id,
            @PathVariable Long invitationId) {
        invitationService.resendInvitation(id, invitationId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("@orgSecurity.hasPermission(#id, 'MEMBERS_VIEW')")
    public ResponseEntity<Page<?>> getMembers(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(memberService.getOrganizationMembers(id, search, pageable));
    }

    @PutMapping("/{id}/members/{memberId}/status")
    @PreAuthorize("@orgSecurity.hasPermission(#id, 'MEMBERS_SUSPEND')")
    public ResponseEntity<?> updateMemberStatus(@PathVariable Long id, @PathVariable Long memberId, @RequestBody Map<String, String> body, @AuthenticationPrincipal User user) {
        memberService.updateMemberStatus(id, memberId, body.get("status"));
        auditService.logAction(organizationRepository.findById(id).orElseThrow(), user, null, "MEMBER_STATUS_UPDATE", "Updated status to " + body.get("status"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/members/{memberId}/role")
    @PreAuthorize("@orgSecurity.hasPermission(#id, 'MEMBERS_UPDATE')")
    public ResponseEntity<?> updateMemberRole(@PathVariable Long id, @PathVariable Long memberId, @RequestBody Map<String, String> body, @AuthenticationPrincipal User user) {
        memberService.updateMemberRole(id, memberId, body.get("role"));
        auditService.logAction(organizationRepository.findById(id).orElseThrow(), user, null, "MEMBER_ROLE_UPDATE", "Updated role to " + body.get("role"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/members/{memberId}")
    @PreAuthorize("@orgSecurity.hasPermission(#id, 'MEMBERS_REMOVE')")
    public ResponseEntity<?> removeMember(@PathVariable Long id, @PathVariable Long memberId, @AuthenticationPrincipal User user) {
        memberService.removeMember(id, memberId);
        auditService.logAction(organizationRepository.findById(id).orElseThrow(), user, null, "MEMBER_REMOVED", "Removed member from organization");
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/analytics")
    @PreAuthorize("@orgSecurity.hasPermission(#id, 'ANALYTICS_VIEW')")
    public ResponseEntity<?> getAnalytics(@PathVariable Long id) {
        return ResponseEntity.ok(analyticsService.getOrganizationMetrics(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@orgSecurity.hasPermission(#id, 'SETTINGS_UPDATE')")
    public ResponseEntity<?> updateSettings(@PathVariable Long id, @RequestBody Organization dto) {
        Organization org = organizationRepository.findById(id).orElseThrow();
        if (dto.getName() != null) org.setName(dto.getName());
        if (dto.getIndustry() != null) org.setIndustry(dto.getIndustry());
        if (dto.getCompanySize() != null) org.setCompanySize(dto.getCompanySize());
        if (dto.getCountry() != null) org.setCountry(dto.getCountry());
        if (dto.getWebsite() != null) org.setWebsite(dto.getWebsite());
        organizationRepository.save(org);
        return ResponseEntity.ok(mapToDto(org));
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
