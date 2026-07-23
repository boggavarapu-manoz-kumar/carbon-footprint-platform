package com.carbonfootprint.controller.admin;

import com.carbonfootprint.dto.admin.AdminLoginRequest;
import com.carbonfootprint.dto.admin.AdminLoginResponse;
import com.carbonfootprint.security.admin.AdminPermissions;
import com.carbonfootprint.service.admin.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
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
        AdminLoginResponse loginResponse = authService.authenticate(request, httpRequest);

        ResponseCookie springCookie = ResponseCookie.from("admin_refresh_token", loginResponse.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/api/v1/admin/auth/refresh")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, springCookie.toString())
                .body(loginResponse);
    }

    @RequestMapping(value = "/refresh", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<AdminLoginResponse> refresh(
            @CookieValue(value = "admin_refresh_token", required = false) String refreshToken,
            HttpServletRequest httpRequest
    ) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        
        AdminLoginResponse newTokens = authService.refreshToken(refreshToken, httpRequest);
        
        ResponseCookie springCookie = ResponseCookie.from("admin_refresh_token", newTokens.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/api/v1/admin/auth/refresh")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, springCookie.toString())
                .body(newTokens);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader(value = "Authorization", required = false) String token,
            @CookieValue(value = "admin_refresh_token", required = false) String refreshToken
    ) {
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        
        ResponseCookie clearCookie = ResponseCookie.from("admin_refresh_token", "")
                .httpOnly(true)
                .secure(false) // Local dev
                .path("/api/v1/admin/auth/refresh")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .build();
    }

    @PostMapping("/sessions/{sessionId}/revoke")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).ADMINS_UPDATE) or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> revokeSession(@PathVariable Long sessionId) {
        authService.revokeSession(sessionId);
        return ResponseEntity.ok().build();
    }
}
