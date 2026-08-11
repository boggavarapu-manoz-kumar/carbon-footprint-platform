package com.carbonfootprint.service;

import com.carbonfootprint.entity.OrganizationMember;
import com.carbonfootprint.entity.OrganizationPermission;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.OrganizationMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service("orgSecurity")
@RequiredArgsConstructor
public class OrganizationSecurityService {

    private final OrganizationMemberRepository organizationMemberRepository;

    /**
     * Used in @PreAuthorize("@orgSecurity.hasPermission(#orgId, 'MEMBERS_INVITE')")
     */
    public boolean hasPermission(Long organizationId, String permissionName) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        Object principal = auth.getPrincipal();
        if (!(principal instanceof User)) {
            return false;
        }

        User user = (User) principal;
        
        Optional<OrganizationMember> memberOpt = organizationMemberRepository
                .findByOrganizationIdAndUserId(organizationId, user.getId());

        if (memberOpt.isEmpty()) {
            return false;
        }

        OrganizationMember member = memberOpt.get();
        if (!"ACTIVE".equals(member.getStatus())) {
            return false;
        }

        try {
            OrganizationPermission permission = OrganizationPermission.valueOf(permissionName);
            return member.getRole().hasPermission(permission);
        } catch (IllegalArgumentException e) {
            return false; // Invalid permission string
        }
    }
    
    /**
     * Checks if the user is a member of the organization, regardless of specific permissions.
     */
    public boolean isMember(Long organizationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        Object principal = auth.getPrincipal();
        if (!(principal instanceof User)) {
            return false;
        }

        User user = (User) principal;
        
        return organizationMemberRepository
                .findByOrganizationIdAndUserId(organizationId, user.getId())
                .filter(member -> "ACTIVE".equals(member.getStatus()))
                .isPresent();
    }
}
