package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.organization.CreateOrganizationDto;
import com.carbonfootprint.dto.organization.OrganizationDto;
import com.carbonfootprint.entity.organization.*;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.*;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.EmailService;
import com.carbonfootprint.service.OrganizationService;
import com.carbonfootprint.util.OrganizationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationSettingsRepository settingsRepository;
    private final OrganizationAdminAssignmentRepository adminAssignmentRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final OrganizationInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    @PreAuthorize("@orgSecurity.hasSuperAdminAccess()")
    public OrganizationDto createOrganization(CreateOrganizationDto dto) {
        
        if (organizationRepository.existsByName(dto.getName())) {
            throw new com.carbonfootprint.exception.BadRequestException("An organization with the name '" + dto.getName() + "' already exists. Please choose a different name.");
        }

        String orgCode = OrganizationUtil.generateUniqueCode(dto.getName());
        
        Organization org = Organization.builder()
                .name(dto.getName())
                .code(orgCode)
                .industry(dto.getIndustry())
                .companySize(dto.getCompanySize())
                .country(dto.getCountry())
                .timezone(dto.getTimezone())
                .logo(dto.getLogo())
                .status(OrganizationStatus.PENDING)
                .createdBy(getCurrentUserId())
                .build();

        org = organizationRepository.save(org);

        OrganizationSettings settings = OrganizationSettings.builder()
                .organization(org)
                .build();
        settingsRepository.save(settings);

        // Generate Invitation for the Admin
        String token = OrganizationUtil.generateInvitationToken();
        OrganizationInvitation invitation = OrganizationInvitation.builder()
                .organization(org)
                .email(dto.getAdminEmail())
                .role(OrganizationRole.ORGANIZATION_ADMIN)
                .token(token)
                .status(InvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        
        invitationRepository.save(invitation);
        
        // Send Email
        emailService.sendOrganizationInvitationEmail(dto.getAdminEmail(), org.getName(), token);

        return mapToDto(org);
    }

    @Override
    @PreAuthorize("@orgSecurity.hasSuperAdminAccess()")
    public OrganizationDto getOrganization(Long id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        return mapToDto(org);
    }

    @Override
    @PreAuthorize("@orgSecurity.hasSuperAdminAccess()")
    public List<OrganizationDto> getAllOrganizations() {
        return organizationRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @PreAuthorize("@orgSecurity.hasSuperAdminAccess()")
    public OrganizationDto updateOrganizationStatus(Long id, OrganizationStatus status) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        org.setStatus(status);
        return mapToDto(organizationRepository.save(org));
    }

    @Override
    @Transactional
    @PreAuthorize("@orgSecurity.hasSuperAdminAccess()")
    public void assignOrganizationAdmin(Long organizationId, Long userId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        com.carbonfootprint.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!adminAssignmentRepository.existsByOrganizationIdAndUserId(organizationId, userId)) {
            OrganizationAdminAssignment assignment = OrganizationAdminAssignment.builder()
                    .organization(org)
                    .user(user)
                    .assignedBy(getCurrentUserId())
                    .build();
            adminAssignmentRepository.save(assignment);
        }

        if (!membershipRepository.existsByOrganizationIdAndUserIdAndStatus(organizationId, userId, MembershipStatus.ACTIVE)) {
            OrganizationMembership membership = membershipRepository.findByOrganizationIdAndUserId(organizationId, userId)
                    .orElseGet(() -> OrganizationMembership.builder()
                            .organization(org)
                            .user(user)
                            .build());

            membership.setRole(OrganizationRole.ORGANIZATION_ADMIN);
            membership.setStatus(MembershipStatus.ACTIVE);
            membershipRepository.save(membership);
        }
    }

    private OrganizationDto mapToDto(Organization org) {
        return OrganizationDto.builder()
                .id(org.getId())
                .name(org.getName())
                .code(org.getCode())
                .industry(org.getIndustry())
                .companySize(org.getCompanySize())
                .country(org.getCountry())
                .timezone(org.getTimezone())
                .logo(org.getLogo())
                .status(org.getStatus())
                .createdAt(org.getCreatedAt())
                .updatedAt(org.getUpdatedAt())
                .build();
    }

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).map(com.carbonfootprint.entity.User::getId).orElse(null);
    }
}
