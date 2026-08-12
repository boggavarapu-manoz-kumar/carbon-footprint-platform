package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.organization.AdminActivationDto;
import com.carbonfootprint.entity.Role;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.entity.organization.*;
import com.carbonfootprint.exception.BadRequestException;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.*;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.OrganizationInvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OrganizationInvitationServiceImpl implements OrganizationInvitationService {

    private final OrganizationInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final OrganizationAdminAssignmentRepository adminAssignmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void activateAdminAccount(AdminActivationDto dto) {
        OrganizationInvitation invitation = invitationRepository.findByToken(dto.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired activation token"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BadRequestException("Invitation is no longer valid");
        }
        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new BadRequestException("Invitation token has expired");
        }

        // Validate user or create new
        User user = userRepository.findByEmail(invitation.getEmail()).orElse(null);
        if (user == null) {
            String tempUsername = "temp_" + java.util.UUID.randomUUID().toString().substring(0, 8);
            user = User.builder()
                    .firstName(dto.getFirstName())
                    .lastName(dto.getLastName())
                    .email(invitation.getEmail())
                    .username(tempUsername)
                    .mobileNumber("")
                    .password(passwordEncoder.encode(dto.getPassword()))
                    .role(Role.USER) // Global role is always USER for org members, they don't get super admin
                    .provider(com.carbonfootprint.entity.AuthProvider.LOCAL)
                    .isSuspended(false)
                    .build();
            user = userRepository.save(user);
        } else {
            // Update existing user's password if they are activating through this flow
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            userRepository.save(user);
        }

        Organization org = invitation.getOrganization();

        // Add to memberships
        if (!membershipRepository.existsByOrganizationIdAndUserIdAndStatus(org.getId(), user.getId(), MembershipStatus.ACTIVE)) {
            OrganizationMembership membership = OrganizationMembership.builder()
                    .organization(org)
                    .user(user)
                    .role(invitation.getRole())
                    .status(MembershipStatus.ACTIVE)
                    .joinedAt(LocalDateTime.now())
                    .build();
            membershipRepository.save(membership);
        }

        // Add to admin assignments if role is ADMIN
        if (invitation.getRole() == OrganizationRole.ORGANIZATION_ADMIN) {
            if (!adminAssignmentRepository.existsByOrganizationIdAndUserId(org.getId(), user.getId())) {
                OrganizationAdminAssignment assignment = OrganizationAdminAssignment.builder()
                        .organization(org)
                        .user(user)
                        .assignedBy(org.getCreatedBy())
                        .build();
                adminAssignmentRepository.save(assignment);
            }

            // Activate the organization if it's currently pending
            if (org.getStatus() == OrganizationStatus.PENDING) {
                org.setStatus(OrganizationStatus.ACTIVE);
                organizationRepository.save(org);
            }
        }

        // Invalidate token
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitationRepository.save(invitation);
    }
    @Override
    @Transactional
    public void activateEmployeeAccount(com.carbonfootprint.dto.organization.EmployeeActivationDto dto) {
        OrganizationInvitation invitation = getValidInvitation(dto.getToken());

        User user = userRepository.findByEmail(invitation.getEmail()).orElse(null);
        if (user == null) {
            String tempUsername = "temp_" + java.util.UUID.randomUUID().toString().substring(0, 8);
            user = User.builder()
                    .firstName(dto.getFirstName())
                    .lastName(dto.getLastName())
                    .email(invitation.getEmail())
                    .username(tempUsername)
                    .mobileNumber("")
                    .password(passwordEncoder.encode(dto.getPassword()))
                    .role(Role.USER)
                    .provider(com.carbonfootprint.entity.AuthProvider.LOCAL)
                    .isSuspended(false)
                    .build();
            user = userRepository.save(user);
        } else {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            userRepository.save(user);
        }

        activateMembership(invitation, user);
    }

    @Override
    @Transactional
    public void acceptEmployeeInvitation(String token, String email) {
        OrganizationInvitation invitation = getValidInvitation(token);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        if (!user.getEmail().equalsIgnoreCase(invitation.getEmail())) {
            throw new BadRequestException("This invitation is for a different email address");
        }
        
        activateMembership(invitation, user);
    }

    private OrganizationInvitation getValidInvitation(String token) {
        OrganizationInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired invitation token"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BadRequestException("Invitation is no longer valid");
        }
        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new BadRequestException("Invitation token has expired");
        }
        return invitation;
    }

    private void activateMembership(OrganizationInvitation invitation, User user) {
        Organization org = invitation.getOrganization();
        
        membershipRepository.findByOrganizationIdAndUserId(org.getId(), user.getId())
            .ifPresentOrElse(membership -> {
                membership.setStatus(MembershipStatus.ACTIVE);
                // Also update metadata if it was present on the invite but missing from the membership
                if (membership.getDepartment() == null && invitation.getDepartment() != null) {
                    membership.setDepartment(invitation.getDepartment());
                }
                if (membership.getJobTitle() == null && invitation.getJobTitle() != null) {
                    membership.setJobTitle(invitation.getJobTitle());
                }
                if (membership.getEmployeeId() == null && invitation.getEmployeeId() != null) {
                    membership.setEmployeeId(invitation.getEmployeeId());
                }
                membershipRepository.save(membership);
            }, () -> {
                OrganizationMembership membership = OrganizationMembership.builder()
                    .organization(org)
                    .user(user)
                    .role(invitation.getRole())
                    .status(MembershipStatus.ACTIVE)
                    .department(invitation.getDepartment())
                    .jobTitle(invitation.getJobTitle())
                    .employeeId(invitation.getEmployeeId())
                    .joinedAt(LocalDateTime.now())
                    .build();
                membershipRepository.save(membership);
            });

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitationRepository.save(invitation);
    }
}
