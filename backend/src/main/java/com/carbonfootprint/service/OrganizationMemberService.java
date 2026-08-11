package com.carbonfootprint.service;

import com.carbonfootprint.dto.organization.OrganizationInvitationDto;
import com.carbonfootprint.dto.organization.OrganizationInviteDto;
import com.carbonfootprint.dto.organization.OrganizationMemberDto;
import com.carbonfootprint.entity.Organization;
import com.carbonfootprint.entity.OrganizationInvitation;
import com.carbonfootprint.entity.OrganizationMember;
import com.carbonfootprint.entity.OrganizationRole;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.exception.BadRequestException;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.OrganizationInvitationRepository;
import com.carbonfootprint.repository.OrganizationMemberRepository;
import com.carbonfootprint.repository.OrganizationRepository;
import com.carbonfootprint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationMemberService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationInvitationRepository invitationRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrganizationInvitationDto inviteEmployee(Long adminUserId, Long organizationId, OrganizationInviteDto dto) {
        // 1. Verify admin has permissions
        verifyAdminAccess(adminUserId, organizationId);

        // 2. Check if already a member
        Optional<User> existingUser = userRepository.findByEmail(dto.getEmail());
        if (existingUser.isPresent()) {
            boolean isAlreadyMember = organizationMemberRepository
                    .findByOrganizationIdAndUserId(organizationId, existingUser.get().getId())
                    .isPresent();
            if (isAlreadyMember) {
                throw new IllegalArgumentException("User is already a member of this organization.");
            }
        }

        // 3. Check for existing pending invitation
        Optional<OrganizationInvitation> existingInvite = invitationRepository
                .findByOrganizationIdAndEmailAndStatus(organizationId, dto.getEmail(), "PENDING");
        
        if (existingInvite.isPresent()) {
            OrganizationInvitation inv = existingInvite.get();
            if (inv.getExpiresAt().isAfter(LocalDateTime.now())) {
                throw new IllegalArgumentException("A valid invitation already exists for this email.");
            } else {
                inv.setStatus("EXPIRED");
                invitationRepository.save(inv);
            }
        }

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        // 4. Create new invitation
        String token = generateSecureToken();
        
        OrganizationInvitation invitation = OrganizationInvitation.builder()
                .organization(organization)
                .email(dto.getEmail())
                .employeeId(dto.getEmployeeId())
                .department(dto.getDepartment())
                .jobTitle(dto.getJobTitle())
                .token(token)
                .status("PENDING")
                .role(com.carbonfootprint.entity.OrganizationRole.EMPLOYEE)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        invitation = invitationRepository.save(invitation);

        // TODO: Send Email asynchronously here
        // emailService.sendOrganizationInviteEmail(dto.getEmail(), organization.getName(), token);

        return mapToDto(invitation);
    }
    
    @Transactional
    public void acceptInvitation(String token, Long userId) {
        OrganizationInvitation invite = invitationRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid invitation token."));

        if (!"PENDING".equals(invite.getStatus())) {
            throw new IllegalArgumentException("Invitation is no longer valid.");
        }

        if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            invite.setStatus("EXPIRED");
            invitationRepository.save(invite);
            throw new IllegalArgumentException("Invitation has expired.");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                
        if (!user.getEmail().equalsIgnoreCase(invite.getEmail())) {
            throw new IllegalArgumentException("Token does not match user email.");
        }

        // Check if already member
        if (organizationMemberRepository.findByOrganizationIdAndUserId(invite.getOrganization().getId(), userId).isPresent()) {
             throw new IllegalArgumentException("User is already a member.");
        }

        // Create membership
        OrganizationMember membership = OrganizationMember.builder()
                .organization(invite.getOrganization())
                .user(user)
                .role(invite.getRole())
                .status("ACTIVE")
                .build();
                
        organizationMemberRepository.save(membership);

        // Invalidate token
        invite.setStatus("ACCEPTED");
        invitationRepository.save(invite);
    }

    @Transactional(readOnly = true)
    public Page<OrganizationMemberDto> getOrganizationMembers(Long orgId, String search, Pageable pageable) {
        return organizationMemberRepository.searchMembers(orgId, search, pageable)
                .map(this::mapMemberToDto);
    }

    @Transactional
    public void updateMemberStatus(Long orgId, Long memberId, String status) {
        OrganizationMember member = organizationMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (!member.getOrganization().getId().equals(orgId)) {
            throw new BadRequestException("Invalid organization context");
        }
        
        if (member.getRole() == OrganizationRole.ORGANIZATION_OWNER) {
            throw new BadRequestException("Cannot suspend the organization owner");
        }

        member.setStatus(status);
        organizationMemberRepository.save(member);
    }

    @Transactional
    public void updateMemberRole(Long orgId, Long memberId, String newRole) {
        OrganizationMember member = organizationMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (!member.getOrganization().getId().equals(orgId)) {
            throw new BadRequestException("Invalid organization context");
        }
        
        if (member.getRole() == OrganizationRole.ORGANIZATION_OWNER) {
            throw new BadRequestException("Cannot change role of the organization owner");
        }
        
        try {
            OrganizationRole parsedRole = OrganizationRole.valueOf(newRole);
            if (parsedRole == OrganizationRole.ORGANIZATION_OWNER) {
                throw new BadRequestException("Cannot assign ORGANIZATION_OWNER role");
            }
            member.setRole(parsedRole);
            organizationMemberRepository.save(member);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role specified");
        }
    }

    @Transactional
    public void removeMember(Long orgId, Long memberId) {
        OrganizationMember member = organizationMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (!member.getOrganization().getId().equals(orgId)) {
            throw new BadRequestException("Invalid organization context");
        }
        
        if (member.getRole() == OrganizationRole.ORGANIZATION_OWNER) {
            throw new BadRequestException("Cannot remove the organization owner");
        }

        organizationMemberRepository.delete(member);
    }

    private void verifyAdminAccess(Long userId, Long organizationId) {
        OrganizationMember member = organizationMemberRepository
                .findByOrganizationIdAndUserId(organizationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Access Denied"));
                
        if (member.getRole() != com.carbonfootprint.entity.OrganizationRole.ORGANIZATION_ADMIN 
            && member.getRole() != com.carbonfootprint.entity.OrganizationRole.ORGANIZATION_OWNER) {
            throw new IllegalArgumentException("Access Denied: Requires Organization Admin privileges");
        }
        
        if (!"ACTIVE".equals(member.getStatus())) {
            throw new IllegalArgumentException("Access Denied: Account is suspended");
        }
    }

    private String generateSecureToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private OrganizationInvitationDto mapToDto(OrganizationInvitation invite) {
        OrganizationInvitationDto dto = new OrganizationInvitationDto();
        dto.setId(invite.getId());
        dto.setOrganizationId(invite.getOrganization().getId());
        dto.setEmail(invite.getEmail());
        dto.setEmployeeId(invite.getEmployeeId());
        dto.setDepartment(invite.getDepartment());
        dto.setJobTitle(invite.getJobTitle());
        dto.setStatus(invite.getStatus());
        dto.setRole(invite.getRole().name());
        dto.setCreatedAt(invite.getCreatedAt());
        dto.setExpiresAt(invite.getExpiresAt());
        // Notice we do NOT map the secure token to the DTO
        return dto;
    }

    private OrganizationMemberDto mapMemberToDto(OrganizationMember member) {
        OrganizationMemberDto dto = new OrganizationMemberDto();
        dto.setId(member.getId());
        dto.setRole(member.getRole());
        dto.setStatus(member.getStatus());
        dto.setDepartment(member.getDepartment());
        dto.setJobTitle(member.getJobTitle());
        dto.setEmployeeId(member.getEmployeeId());
        dto.setJoinedAt(member.getJoinedAt());
        dto.setLastActivity(member.getUpdatedAt()); // Using updatedAt as proxy for last activity

        OrganizationMemberDto.UserSummaryDto userDto = new OrganizationMemberDto.UserSummaryDto();
        userDto.setId(member.getUser().getId());
        userDto.setFirstName(member.getUser().getFirstName());
        userDto.setLastName(member.getUser().getLastName());
        userDto.setEmail(member.getUser().getEmail());
        
        dto.setUser(userDto);
        return dto;
    }
}
