package com.carbonfootprint.security.admin;

import com.carbonfootprint.repository.admin.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

@Component("adminSecurity")
@RequiredArgsConstructor
@Slf4j
public class AdminSecurity {

    private final AdminUserRepository adminUserRepository;

    /**
     * IDOR and Privilege Escalation Prevention.
     * Evaluates if the currently authenticated admin is allowed to modify the target admin user.
     * Prevents modifying SUPER_ADMIN accounts unless the actor is also a SUPER_ADMIN.
     *
     * @param authentication The current security context
     * @param targetAdminId The ID of the admin being modified
     * @return true if authorized, false otherwise
     */
    public boolean canManageAdmin(Authentication authentication, String targetAdminId) {
        if (authentication == null || targetAdminId == null) {
            return false;
        }

        var targetUserOpt = adminUserRepository.findById(targetAdminId);
        if (targetUserOpt.isEmpty()) {
            return true; // Let the controller handle 404
        }

        var targetUser = targetUserOpt.get();
        boolean isTargetSuperAdmin = targetUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals("SUPER_ADMIN"));

        if (isTargetSuperAdmin) {
            boolean isActorSuperAdmin = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(role -> role.equals("ROLE_SUPER_ADMIN"));

            if (!isActorSuperAdmin) {
                log.warn("PRIVILEGE ESCALATION ATTEMPT: Non-SuperAdmin '{}' attempted to modify SuperAdmin '{}'", 
                        authentication.getName(), targetAdminId);
                return false;
            }
        }
        return true;
    }
}
