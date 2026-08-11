package com.carbonfootprint.controller;

import com.carbonfootprint.dto.UserCreateDto;
import com.carbonfootprint.dto.auth.AuthenticationRequest;
import com.carbonfootprint.dto.auth.AuthenticationResponse;
import com.carbonfootprint.dto.auth.ForgotPasswordRequest;
import com.carbonfootprint.dto.auth.ResetPasswordRequest;
import com.carbonfootprint.dto.auth.ActivationRequestDto;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.AuthService;
import com.carbonfootprint.service.OrganizationInvitationService;
import com.carbonfootprint.entity.OrganizationInvitation;
import com.carbonfootprint.repository.OrganizationInvitationRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OrganizationInvitationService invitationService;
    private final OrganizationInvitationRepository invitationRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> register(
            @Valid @RequestBody UserCreateDto request) {
        return ResponseEntity.ok(ApiResponse.success(authService.register(request), "Registration successful"));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> authenticate(
            @Valid @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.authenticate(request), "Authentication successful"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request.getEmail());
        return ResponseEntity
                .ok(ApiResponse.success(null, "A password reset link has been sent to your email."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success(null, "Password has been successfully reset."));
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<ApiResponse<Void>> validateResetToken(
            @RequestParam String token) {
        authService.validatePasswordResetToken(token);
        return ResponseEntity.ok(ApiResponse.success(null, "Token is valid."));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> refreshToken(
            @Valid @RequestBody com.carbonfootprint.dto.auth.RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.refreshToken(request.getRefreshToken()),
                "Token refreshed successfully"));
    }

    @GetMapping("/invitation/validate")
    public ResponseEntity<ApiResponse<Void>> validateInvitationToken(@RequestParam String token) {
        OrganizationInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new com.carbonfootprint.exception.ResourceNotFoundException("Invalid or expired invitation token"));
        
        if (!"PENDING".equals(invitation.getStatus()) || LocalDateTime.now().isAfter(invitation.getExpiresAt())) {
            throw new com.carbonfootprint.exception.BadRequestException("Invitation is no longer valid or has expired");
        }
        
        return ResponseEntity.ok(ApiResponse.success(null, "Token is valid."));
    }

    @PostMapping("/invitation/activate")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> activateFromInvitation(
            @Valid @RequestBody ActivationRequestDto request) {
        String jwtToken = invitationService.activateAccountFromInvitation(
                request.getToken(),
                request.getFirstName(),
                request.getLastName(),
                request.getPassword()
        );
        
        AuthenticationResponse response = AuthenticationResponse.builder()
                .accessToken(jwtToken)
                // for simplicity in this flow, refresh token could be added if needed, but access token is enough to start
                .build();
                
        return ResponseEntity.ok(ApiResponse.success(response, "Account activated successfully"));
    }
}
