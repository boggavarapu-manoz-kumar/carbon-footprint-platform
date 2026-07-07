package com.carbonfootprint.controller.admin;

import com.carbonfootprint.dto.admin.AdminLoginRequest;
import com.carbonfootprint.dto.admin.AdminLoginResponse;
import com.carbonfootprint.security.admin.AdminPermissions;
import com.carbonfootprint.service.admin.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> authenticate(
            @Valid @RequestBody AdminLoginRequest request,
            HttpServletRequest httpRequest
    ) {
        return ResponseEntity.ok(authService.authenticate(request, httpRequest));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        // Additional logout logic can be added here if needed to parse JWT and extract SID
        // Currently handled by Revoke for simplicity
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sessions/{sessionId}/revoke")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ADMINS_UPDATE) or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> revokeSession(@PathVariable Long sessionId) {
        authService.revokeSession(sessionId);
        return ResponseEntity.ok().build();
    }
}
