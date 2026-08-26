package com.carbonfootprint.security;

import com.carbonfootprint.entity.User;
import com.carbonfootprint.entity.organization.OrganizationRole;
import com.carbonfootprint.repository.OrganizationMembershipRepository;
import com.carbonfootprint.repository.OrganizationAdminAssignmentRepository;
import com.carbonfootprint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("orgSecurity")
@RequiredArgsConstructor
public class OrganizationSecurityService {

    private final OrganizationMembershipRepository membershipRepository;
    private final OrganizationAdminAssignmentRepository adminAssignmentRepository;
    private final UserRepository userRepository;

    public boolean hasSuperAdminAccess() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"))) {
            return true;
        }
        User user = getCurrentUser();
        return user != null && user.getRole() == com.carbonfootprint.entity.Role.SUPER_ADMIN; 
    }

    public boolean hasOrganizationAdminAccess(Long organizationId) {
        User user = getCurrentUser();
        if (user == null) return false;

        // Check if assigned by Super Admin
        boolean isAssignedAdmin = adminAssignmentRepository.existsByOrganizationIdAndUserId(organizationId, user.getId());
        if (isAssignedAdmin) return true;

        // Check membership with ADMIN role
        return membershipRepository.findByOrganizationIdAndUserId(organizationId, user.getId())
                .map(membership -> membership.getRole() == OrganizationRole.ORGANIZATION_ADMIN)
                .orElse(false);
    }

    public boolean hasOrganizationEmployeeAccess(Long organizationId) {
        User user = getCurrentUser();
        if (user == null) return false;

        // Both ADMIN and EMPLOYEE have employee access level to view things
        return membershipRepository.findByOrganizationIdAndUserId(organizationId, user.getId()).isPresent();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String identifier = authentication.getName();
        return userRepository.findByUsernameOrEmail(identifier, identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .or(() -> userRepository.findByUsername(identifier))
                .orElse(null);
    }
}
