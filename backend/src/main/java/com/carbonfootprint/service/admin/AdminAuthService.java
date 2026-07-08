package com.carbonfootprint.service.admin;

import com.carbonfootprint.dto.admin.AdminLoginRequest;
import com.carbonfootprint.dto.admin.AdminLoginResponse;
import com.carbonfootprint.entity.admin.AdminDeviceTracking;
import com.carbonfootprint.entity.admin.AdminLoginHistory;
import com.carbonfootprint.entity.admin.AdminSecurityEvent;
import com.carbonfootprint.entity.admin.AdminSession;
import com.carbonfootprint.repository.admin.AdminDeviceTrackingRepository;
import com.carbonfootprint.repository.admin.AdminLoginHistoryRepository;
import com.carbonfootprint.repository.admin.AdminSecurityEventRepository;
import com.carbonfootprint.repository.admin.AdminSessionRepository;
import com.carbonfootprint.repository.admin.AdminUserRepository;
import com.carbonfootprint.security.admin.AdminJwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

import lombok.extern.slf4j.Slf4j;

/**
 * Service responsible for handling Admin Authentication flows.
 * Incorporates brute-force protection, device fingerprinting, and session tracking
 * to ensure enterprise-grade security without compromising standard user authentication.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final AdminSessionRepository adminSessionRepository;
    private final AdminLoginHistoryRepository loginHistoryRepository;
    private final AdminDeviceTrackingRepository deviceTrackingRepository;
    private final AdminSecurityEventRepository securityEventRepository;
    private final AdminJwtService adminJwtService;
    private final PasswordEncoder passwordEncoder;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    public AdminLoginResponse authenticate(AdminLoginRequest request, HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        // 1. Brute Force Check
        long recentFailures = loginHistoryRepository.countByEmailAttemptedAndStatusAndCreatedAtAfter(
                request.getEmail(),
                "FAILED",
                LocalDateTime.now().minusMinutes(LOCKOUT_MINUTES)
        );

        if (recentFailures >= MAX_FAILED_ATTEMPTS) {
            log.warn("Brute-force attempt blocked for email: {}, IP: {}", request.getEmail(), ipAddress);
            logLoginHistory(null, request.getEmail(), ipAddress, userAgent, "LOCKED");
            throw new RuntimeException("Account is temporarily locked due to excessive failed attempts.");
        }

        log.debug("Authenticating admin user: {}", request.getEmail());
        var adminUser = adminUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Failed authentication attempt for email: {}", request.getEmail());
                    logLoginHistory(null, request.getEmail(), ipAddress, userAgent, "FAILED");
                    return new BadCredentialsException("Invalid credentials");
                });

        if (!passwordEncoder.matches(request.getPassword(), adminUser.getPassword())) {
            log.warn("Failed authentication attempt for email: {}", request.getEmail());
            logLoginHistory(null, request.getEmail(), ipAddress, userAgent, "FAILED");
            throw new BadCredentialsException("Invalid credentials");
        }

        // 3. Device Fingerprinting
        var deviceTracking = deviceTrackingRepository.findByAdminUser_IdAndDeviceFingerprint(
                adminUser.getId(), request.getDeviceFingerprint()
        ).orElseGet(() -> {
            log.warn("Unknown device fingerprint detected for admin ID: {}", adminUser.getId());
            // Log Suspicious Login Event for Unknown Device
            AdminSecurityEvent event = AdminSecurityEvent.builder()
                    .adminUser(adminUser)
                    .eventType("UNKNOWN_DEVICE_LOGIN")
                    .severity("HIGH")
                    .description("Login from unrecognized device fingerprint: " + request.getDeviceFingerprint())
                    .ipAddress(ipAddress)
                    .build();
            securityEventRepository.save(event);

            return AdminDeviceTracking.builder()
                    .adminUser(adminUser)
                    .deviceFingerprint(request.getDeviceFingerprint())
                    .os("Unknown") // Would parse UserAgent in real scenario
                    .browser("Unknown") // Would parse UserAgent in real scenario
                    .isTrusted(false)
                    .build();
        });

        deviceTracking.setLastActive(LocalDateTime.now());
        deviceTrackingRepository.save(deviceTracking);

        // 4. Create Initial Session without tokens
        AdminSession session = AdminSession.builder()
                .adminUser(adminUser)
                .accessToken("placeholder")
                .refreshToken("placeholder")
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .expiresAt(LocalDateTime.now().plusMinutes(15)) // Access token TTL
                .build();
        session = adminSessionRepository.save(session);

        // 5. Generate Tokens with Session ID and Fingerprints
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("ip_hash", hashFingerprint(ipAddress));
        extraClaims.put("ua_hash", hashFingerprint(userAgent));
        extraClaims.put("role", adminUser.getRoles().stream().findFirst().map(com.carbonfootprint.entity.admin.AdminRole::getName).orElse("SUPER_ADMIN"));
        
        String jwtToken = adminJwtService.generateAdminToken(extraClaims, adminUser, session.getId());
        String refreshToken = adminJwtService.generateAdminRefreshToken(adminUser, session.getId());

        // 6. Update Session
        session.setAccessToken(jwtToken);
        session.setRefreshToken(refreshToken);
        adminSessionRepository.save(session);

        logLoginHistory(adminUser.getId(), request.getEmail(), ipAddress, userAgent, "SUCCESS");

        return AdminLoginResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .sessionId(session.getId())
                .build();
    }

    public void revokeSession(Long sessionId) {
        log.info("Attempting to revoke session ID: {}", sessionId);
        adminSessionRepository.findById(sessionId).ifPresent(session -> {
            session.setRevoked(true);
            adminSessionRepository.save(session);
            log.info("Successfully revoked session ID: {}", sessionId);
        });
    }

    public AdminLoginResponse refreshToken(String refreshToken, HttpServletRequest request) {
        String username = adminJwtService.extractUsername(refreshToken);
        var adminUser = adminUserRepository.findByEmail(username).orElseThrow();
        
        if (!adminJwtService.isTokenValid(refreshToken, adminUser)) {
            throw new RuntimeException("Invalid refresh token");
        }
        
        Long sessionId = adminJwtService.extractSessionId(refreshToken);
        var session = adminSessionRepository.findById(sessionId).orElseThrow();
        if (session.isRevoked() || session.getRefreshToken() == null || !session.getRefreshToken().equals(refreshToken)) {
            throw new RuntimeException("Invalid or revoked session");
        }
        
        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("ip_hash", hashFingerprint(ipAddress));
        extraClaims.put("ua_hash", hashFingerprint(userAgent));
        extraClaims.put("role", adminUser.getRoles().stream().findFirst().map(com.carbonfootprint.entity.admin.AdminRole::getName).orElse("SUPER_ADMIN"));
        
        String newJwtToken = adminJwtService.generateAdminToken(extraClaims, adminUser, sessionId);
        String newRefreshToken = adminJwtService.generateAdminRefreshToken(adminUser, sessionId);
        
        session.setAccessToken(newJwtToken);
        session.setRefreshToken(newRefreshToken);
        session.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        adminSessionRepository.save(session);
        
        return AdminLoginResponse.builder()
                .accessToken(newJwtToken)
                .refreshToken(newRefreshToken)
                .sessionId(sessionId)
                .build();
    }

    public void logout(String refreshToken) {
        try {
            Long sessionId = adminJwtService.extractSessionId(refreshToken);
            revokeSession(sessionId);
        } catch (Exception e) {
            log.warn("Failed to extract session ID during logout: {}", e.getMessage());
        }
    }

    private void logLoginHistory(String adminId, String email, String ip, String ua, String status) {
        var user = adminId != null ? adminUserRepository.findById(adminId).orElse(null) : null;
        AdminLoginHistory history = AdminLoginHistory.builder()
                .adminUser(user)
                .emailAttempted(email)
                .ipAddress(ip)
                .userAgent(ua)
                .status(status)
                .build();
        loginHistoryRepository.save(history);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    private String hashFingerprint(String input) {
        if (input == null) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(input.hashCode());
        }
    }
}
