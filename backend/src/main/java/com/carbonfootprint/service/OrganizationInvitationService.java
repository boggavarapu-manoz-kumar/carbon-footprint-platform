package com.carbonfootprint.service;

import com.carbonfootprint.dto.organization.OrganizationInvitationCreateDto;
import com.carbonfootprint.entity.*;
import com.carbonfootprint.exception.BadRequestException;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.OrganizationInvitationRepository;
import com.carbonfootprint.repository.OrganizationMemberRepository;
import com.carbonfootprint.repository.OrganizationRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrganizationInvitationService {

    private final OrganizationInvitationRepository invitationRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private static final int EXPIRATION_DAYS = 7;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Transactional
    public void inviteMember(Long organizationId, OrganizationInvitationCreateDto dto) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        // Check existing user and membership
        Optional<User> existingUser = userRepository.findByEmail(dto.getEmail());
        if (existingUser.isPresent()) {
            boolean isAlreadyMember = memberRepository.findByOrganizationIdAndUserId(organizationId, existingUser.get().getId()).isPresent();
            if (isAlreadyMember) {
                throw new BadRequestException("User is already a member of this organization");
            }
        }

        // Prevent duplicate pending invitations
        Optional<OrganizationInvitation> pendingInvite = invitationRepository.findByOrganizationIdAndEmailAndStatus(organizationId, dto.getEmail(), "PENDING");
        if (pendingInvite.isPresent()) {
            throw new BadRequestException("An invitation is already pending for this email");
        }

        OrganizationRole role;
        try {
            role = dto.getRole() != null ? OrganizationRole.valueOf(dto.getRole()) : OrganizationRole.EMPLOYEE;
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role specified");
        }

        OrganizationInvitation invitation = OrganizationInvitation.builder()
                .organization(org)
                .email(dto.getEmail())
                .token(generateSecureToken())
                .employeeId(dto.getEmployeeId())
                .department(dto.getDepartment())
                .jobTitle(dto.getJobTitle())
                .status("PENDING")
                .role(role)
                .expiresAt(LocalDateTime.now().plusDays(EXPIRATION_DAYS))
                .build();

        invitationRepository.save(invitation);

        // Send Email
        String inviteLink = "https://app.carbonfootprint.com/organizations/join?token=" + invitation.getToken();
        String emailBody = "You have been invited to join " + org.getName() + " on the Carbon Footprint Platform.\n\n" +
                "Click the link below to accept the invitation:\n" + inviteLink;
        emailService.queueEmail(dto.getEmail(), "Organization Invitation: " + org.getName(), emailBody);
    }

    @Transactional
    public void bulkInviteMembers(Long organizationId, java.util.List<OrganizationInvitationCreateDto> dtos) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        for (OrganizationInvitationCreateDto dto : dtos) {
            try {
                // Prevent duplicate pending invitations
                Optional<OrganizationInvitation> pendingInvite = invitationRepository.findByOrganizationIdAndEmailAndStatus(organizationId, dto.getEmail(), "PENDING");
                if (pendingInvite.isPresent()) {
                    continue; // Skip if already pending
                }

                // Check existing user and membership
                Optional<User> existingUser = userRepository.findByEmail(dto.getEmail());
                if (existingUser.isPresent()) {
                    boolean isAlreadyMember = memberRepository.findByOrganizationIdAndUserId(organizationId, existingUser.get().getId()).isPresent();
                    if (isAlreadyMember) {
                        continue; // Skip if already member
                    }
                }

                OrganizationRole role = OrganizationRole.EMPLOYEE;
                try {
                    if (dto.getRole() != null) {
                        role = OrganizationRole.valueOf(dto.getRole());
                    }
                } catch (Exception ignored) { }

                OrganizationInvitation invitation = OrganizationInvitation.builder()
                        .organization(org)
                        .email(dto.getEmail())
                        .token(generateSecureToken())
                        .employeeId(dto.getEmployeeId())
                        .department(dto.getDepartment())
                        .jobTitle(dto.getJobTitle())
                        .status("PENDING")
                        .role(role)
                        .expiresAt(LocalDateTime.now().plusDays(EXPIRATION_DAYS))
                        .build();

                invitationRepository.save(invitation);

                String inviteLink = "https://app.carbonfootprint.com/organizations/join?token=" + invitation.getToken();
                String emailBody = "You have been invited to join " + org.getName() + " on the Carbon Footprint Platform.\n\n" +
                        "Click the link below to accept the invitation:\n" + inviteLink;
                emailService.queueEmail(dto.getEmail(), "Organization Invitation: " + org.getName(), emailBody);

            } catch (Exception e) {
                // Skip failed individual invitations but continue batch
            }
        }
    }

    @Transactional
    public void acceptInvitation(String token, User authenticatedUser) {
        OrganizationInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired invitation token"));

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new BadRequestException("Invitation is no longer valid (Status: " + invitation.getStatus() + ")");
        }

        if (LocalDateTime.now().isAfter(invitation.getExpiresAt())) {
            invitation.setStatus("EXPIRED");
            invitationRepository.save(invitation);
            throw new BadRequestException("Invitation has expired");
        }

        if (!invitation.getEmail().equalsIgnoreCase(authenticatedUser.getEmail())) {
            throw new BadRequestException("This invitation is not for your email address");
        }

        // Check if already member
        boolean isAlreadyMember = memberRepository.findByOrganizationIdAndUserId(invitation.getOrganization().getId(), authenticatedUser.getId()).isPresent();
        if (isAlreadyMember) {
            invitation.setStatus("ACCEPTED");
            invitationRepository.save(invitation);
            return; // Silently resolve
        }

        OrganizationMember member = OrganizationMember.builder()
                .organization(invitation.getOrganization())
                .user(authenticatedUser)
                .role(invitation.getRole())
                .status("ACTIVE")
                .department(invitation.getDepartment())
                .jobTitle(invitation.getJobTitle())
                .employeeId(invitation.getEmployeeId())
                .joinedAt(LocalDateTime.now())
                .build();

        memberRepository.save(member);

        invitation.setStatus("ACCEPTED");
        invitationRepository.save(invitation);
    }

    @Transactional
    public void revokeInvitation(Long organizationId, Long invitationId) {
        OrganizationInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!invitation.getOrganization().getId().equals(organizationId)) {
            throw new BadRequestException("Invalid organization context");
        }

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new BadRequestException("Cannot revoke invitation with status: " + invitation.getStatus());
        }

        invitation.setStatus("REVOKED");
        invitationRepository.save(invitation);
    }

    @Transactional
    public void resendInvitation(Long organizationId, Long invitationId) {
        OrganizationInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!invitation.getOrganization().getId().equals(organizationId)) {
            throw new BadRequestException("Invalid organization context");
        }

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new BadRequestException("Cannot resend invitation with status: " + invitation.getStatus());
        }

        // Extend expiration
        invitation.setExpiresAt(LocalDateTime.now().plusDays(EXPIRATION_DAYS));
        invitationRepository.save(invitation);

        String inviteLink = "https://app.carbonfootprint.com/organizations/join?token=" + invitation.getToken();
        String emailBody = "Reminder: You have been invited to join " + invitation.getOrganization().getName() + " on the Carbon Footprint Platform.\n\n" +
                "Click the link below to accept the invitation:\n" + inviteLink;
        emailService.queueEmail(invitation.getEmail(), "Organization Invitation Reminder: " + invitation.getOrganization().getName(), emailBody);
    }

    @Transactional
    public java.util.Map<String, String> inviteAdmin(Long organizationId, String adminName, String adminEmail) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        String token = generateSecureToken();
        OrganizationInvitation invitation = OrganizationInvitation.builder()
                .organization(org)
                .email(adminEmail)
                .token(token)
                .status("PENDING")
                .role(OrganizationRole.ORGANIZATION_ADMIN)
                .expiresAt(LocalDateTime.now().plusDays(EXPIRATION_DAYS))
                .build();

        invitationRepository.save(invitation);

        Optional<User> existingUserOpt = userRepository.findByEmail(adminEmail);
        String tempPassword = null;
        User adminUser;
        if (existingUserOpt.isPresent()) {
            adminUser = existingUserOpt.get();
        } else {
            tempPassword = "Admin#" + (100000 + SECURE_RANDOM.nextInt(899999));
            String firstName = (adminName != null && !adminName.trim().isEmpty()) ? adminName.split(" ")[0] : "Admin";
            String lastName = (adminName != null && adminName.contains(" ")) ? adminName.substring(adminName.indexOf(" ") + 1) : "User";
            
            adminUser = User.builder()
                    .email(adminEmail)
                    .firstName(firstName)
                    .lastName(lastName)
                    .username(adminEmail.split("@")[0] + "_" + SECURE_RANDOM.nextInt(10000))
                    .mobileNumber("0000000000")
                    .gender("NOT_SPECIFIED")
                    .password(passwordEncoder.encode(tempPassword))
                    .role(Role.USER)
                    .isSuspended(false)
                    .provider(AuthProvider.LOCAL)
                    .build();
            userRepository.save(adminUser);
        }

        boolean isAlreadyMember = memberRepository.findByOrganizationIdAndUserId(org.getId(), adminUser.getId()).isPresent();
        if (!isAlreadyMember) {
            OrganizationMember member = OrganizationMember.builder()
                    .organization(org)
                    .user(adminUser)
                    .role(OrganizationRole.ORGANIZATION_ADMIN)
                    .status("ACTIVE")
                    .joinedAt(LocalDateTime.now())
                    .build();
            memberRepository.save(member);
        }

        // Keep status PENDING so the invitation link in email can be clicked and validated
        invitationRepository.save(invitation);

        String activateUrl = "http://localhost:5173/activate?token=" + invitation.getToken();
        emailService.sendOrgAdminCredentialsEmail(adminEmail, adminName, org.getName(), org.getOrganizationCode(), tempPassword, activateUrl);

        java.util.Map<String, String> result = new java.util.HashMap<>();
        result.put("adminEmail", adminEmail);
        result.put("tempPassword", tempPassword != null ? tempPassword : "Use existing account password");
        result.put("activateUrl", activateUrl);
        return result;
    }

    @Transactional
    public void inviteAdmin(Long organizationId, OrganizationInvitationCreateDto dto) {
        inviteAdmin(organizationId, null, dto.getEmail());
    }

    @Transactional
    public String activateAccountFromInvitation(String token, String firstName, String lastName, String password) {
        OrganizationInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired invitation token"));

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new BadRequestException("Invitation is no longer valid");
        }

        if (LocalDateTime.now().isAfter(invitation.getExpiresAt())) {
            invitation.setStatus("EXPIRED");
            invitationRepository.save(invitation);
            throw new BadRequestException("Invitation has expired");
        }

        // Create or get user
        User user = userRepository.findByEmail(invitation.getEmail()).orElseGet(() -> {
            User newUser = User.builder()
                    .email(invitation.getEmail())
                    .firstName(firstName)
                    .lastName(lastName)
                    .username(invitation.getEmail().split("@")[0] + "_" + SECURE_RANDOM.nextInt(10000))
                    .mobileNumber("0000000000")
                    .gender("NOT_SPECIFIED")
                    .password(passwordEncoder.encode(password))
                    .role(Role.USER)
                    .isSuspended(false)
                    .provider(AuthProvider.LOCAL)
                    .build();
            return userRepository.save(newUser);
        });

        // Add to org
        boolean isAlreadyMember = memberRepository.findByOrganizationIdAndUserId(invitation.getOrganization().getId(), user.getId()).isPresent();
        if (!isAlreadyMember) {
            OrganizationMember member = OrganizationMember.builder()
                    .organization(invitation.getOrganization())
                    .user(user)
                    .role(invitation.getRole())
                    .status("ACTIVE")
                    .department(invitation.getDepartment())
                    .jobTitle(invitation.getJobTitle())
                    .employeeId(invitation.getEmployeeId())
                    .joinedAt(LocalDateTime.now())
                    .build();
            memberRepository.save(member);
        }

        invitation.setStatus("ACCEPTED");
        invitationRepository.save(invitation);

        return jwtService.generateToken(user);
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
