package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.organization.InviteEmployeeDto;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.entity.organization.*;
import com.carbonfootprint.exception.BadRequestException;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.OrganizationInvitationRepository;
import com.carbonfootprint.repository.OrganizationMembershipRepository;
import com.carbonfootprint.repository.OrganizationRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.EmailService;
import com.carbonfootprint.service.OrganizationAdminService;
import com.carbonfootprint.util.OrganizationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrganizationAdminServiceImpl implements OrganizationAdminService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final OrganizationInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    @PreAuthorize("@orgSecurity.hasOrganizationAdminAccess(#organizationId)")
    public void inviteEmployee(Long organizationId, InviteEmployeeDto dto) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        // Check if user already exists and is already a member
        Optional<User> existingUser = userRepository.findByEmail(dto.getEmail());
        if (existingUser.isPresent()) {
            boolean isMember = membershipRepository.existsByOrganizationIdAndUserIdAndStatus(
                    organizationId, existingUser.get().getId(), MembershipStatus.ACTIVE);
            if (isMember) {
                throw new BadRequestException("User is already an active member of this organization");
            }
        }

        // Check for pending invitation
        Optional<OrganizationInvitation> existingInvitation = invitationRepository.findByOrganizationIdAndEmail(organizationId, dto.getEmail());
        if (existingInvitation.isPresent() && existingInvitation.get().getStatus() == InvitationStatus.PENDING && existingInvitation.get().getExpiresAt().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("A pending invitation already exists for this email");
        }

        // Generate invitation
        String token = OrganizationUtil.generateInvitationToken();
        OrganizationInvitation invitation = OrganizationInvitation.builder()
                .organization(org)
                .email(dto.getEmail())
                .role(OrganizationRole.ORGANIZATION_EMPLOYEE)
                .token(token)
                .status(InvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        
        invitationRepository.save(invitation);

        // Store employee details in membership in an INVITED state to preserve the provided job title / department
        if (existingUser.isPresent()) {
            OrganizationMembership membership = OrganizationMembership.builder()
                    .organization(org)
                    .user(existingUser.get())
                    .role(OrganizationRole.ORGANIZATION_EMPLOYEE)
                    .status(MembershipStatus.INVITED)
                    .department(dto.getDepartment())
                    .jobTitle(dto.getJobTitle())
                    .employeeId(dto.getEmployeeId())
                    .build();
            membershipRepository.save(membership);
        }

        emailService.sendEmployeeInvitationEmail(dto.getEmail(), org.getName(), token);
    }
}
