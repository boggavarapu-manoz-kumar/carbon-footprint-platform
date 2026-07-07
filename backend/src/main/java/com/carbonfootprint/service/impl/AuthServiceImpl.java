package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.UserCreateDto;
import com.carbonfootprint.dto.auth.AuthenticationRequest;
import com.carbonfootprint.dto.auth.AuthenticationResponse;
import com.carbonfootprint.entity.Token;
import com.carbonfootprint.entity.TokenType;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.exception.BadRequestException;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.mapper.UserMapper;
import com.carbonfootprint.repository.TokenRepository;
import com.carbonfootprint.repository.PasswordResetTokenRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.security.JwtService;
import com.carbonfootprint.service.ActivityLogService;
import com.carbonfootprint.service.AuthService;
import com.carbonfootprint.service.EmailService;
import com.carbonfootprint.dto.activity.ActivityLogCreateDto;
import com.carbonfootprint.entity.ActivityCategory;
import com.carbonfootprint.entity.PasswordResetToken;
import com.carbonfootprint.exception.TooManyRequestsException;
import java.time.LocalDateTime;
import java.util.UUID;
import java.time.temporal.ChronoUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final ActivityLogService activityLogService;

    @Override
    @Transactional
    public AuthenticationResponse register(UserCreateDto request) {
        log.info("Registering new user: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken: " + request.getUsername());
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        String avatarUrl;
        if ("MALE".equalsIgnoreCase(request.getGender())) {
            avatarUrl = "https://api.dicebear.com/9.x/micah/svg?seed=" + request.getUsername() + "&backgroundColor=b6e3f4";
        } else if ("FEMALE".equalsIgnoreCase(request.getGender())) {
            avatarUrl = "https://api.dicebear.com/9.x/lorelei/svg?seed=" + request.getUsername() + "&backgroundColor=ffd5dc";
        } else {
            avatarUrl = "https://api.dicebear.com/9.x/bottts/svg?seed=" + request.getUsername() + "&backgroundColor=e2e8f0";
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(request.getUsername())
                .mobileNumber(request.getMobileNumber())
                .gender(request.getGender())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .profilePictureUrl(avatarUrl)
                .build();

        User savedUser = userRepository.save(user);

        String jwtToken = jwtService.generateToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);

        saveUserToken(savedUser, jwtToken);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .user(userMapper.toDto(savedUser))
                .build();
    }

    @Override
    @Transactional
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        log.info("Authenticating user: {}", request.getLoginIdentifier());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getLoginIdentifier(),
                        request.getPassword()));

        User user = userRepository.findByUsernameOrEmail(request.getLoginIdentifier(), request.getLoginIdentifier())
                .orElseThrow(() -> new ResourceNotFoundException("User", "loginIdentifier", request.getLoginIdentifier()));

        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .user(userMapper.toDto(user))
                .build();
    }

    private void saveUserToken(User user, String jwtToken) {
        Token token = Token.builder()
                .user(user)
                .token(jwtToken)
                .tokenType(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }

    private void revokeAllUserTokens(User user) {
        var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if (validUserTokens.isEmpty())
            return;

        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }

    @Override
    @Transactional
    public void requestPasswordReset(String email) {
        log.info("Processing password reset request for: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("You don't have an account. Please go to register."));

        // Rate Limiting (3 minutes)
        if (user.getLastPasswordResetRequest() != null &&
                ChronoUnit.MINUTES.between(user.getLastPasswordResetRequest(),
                        LocalDateTime.now(java.time.ZoneOffset.UTC)) < 3) {
            log.warn("Rate limit exceeded for password reset request: {}", email);
            throw new TooManyRequestsException("Please wait 3 minutes before requesting another reset link.");
        }

        passwordResetTokenRepository.deleteByUser(user);
        passwordResetTokenRepository.flush();

        String rawToken = UUID.randomUUID().toString();
        String hashedToken = hashToken(rawToken);

        PasswordResetToken token = PasswordResetToken.builder()
                .token(hashedToken)
                .user(user)
                .expiryDate(LocalDateTime.now(java.time.ZoneOffset.UTC).plusMinutes(3))
                .build();
        passwordResetTokenRepository.save(token);

        user.setLastPasswordResetRequest(LocalDateTime.now(java.time.ZoneOffset.UTC));
        userRepository.save(user);

        // Log security event
        logActivity(user.getEmail(), "PASSWORD_RESET_REQUESTED", "User requested a password reset link.");

        emailService.sendPasswordResetEmail(user.getEmail(), rawToken);
    }

    @Override
    @Transactional(readOnly = true)
    public void validatePasswordResetToken(String token) {
        String hashedToken = hashToken(token);

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(hashedToken)
                .orElseThrow(() -> new BadRequestException("Invalid or missing password reset token."));

        if (resetToken.isUsed()) {
            throw new BadRequestException("This password reset link has already been used.");
        }

        if (resetToken.isExpired()) {
            throw new BadRequestException("This password reset link has expired.");
        }
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("Processing password reset for token");
        String hashedToken = hashToken(token);

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(hashedToken)
                .orElseThrow(() -> new BadRequestException("Invalid or missing token"));

        if (resetToken.isUsed()) {
            throw new BadRequestException("This password reset link has already been used. Please request a new one.");
        }

        if (resetToken.isExpired()) {
            throw new BadRequestException("This password reset link has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));

        // Reset the rate limit timer on success
        user.setLastPasswordResetRequest(null);
        userRepository.save(user);

        // Mark token as used instead of deleting it
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        revokeAllUserTokens(user);

        // Log security event
        logActivity(user.getEmail(), "PASSWORD_RESET_COMPLETED", "User successfully reset their password.");
    }

    @Override
    @Transactional
    public AuthenticationResponse refreshToken(String refreshToken) {
        log.info("Processing token refresh");
        String userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new BadRequestException("User not found"));
            if (jwtService.isTokenValid(refreshToken, user)) {
                String accessToken = jwtService.generateToken(user);
                // Keep the same refresh token, just issue a new access token
                revokeAllUserTokens(user);
                saveUserToken(user, accessToken);
                return AuthenticationResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .build();
            }
        }
        throw new BadRequestException("Invalid or expired refresh token");
    }

    private String hashToken(String token) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }

    private void logActivity(String email, String action, String description) {
        log.info("SECURITY EVENT - User: {}, Action: {}, Description: {}", email, action, description);
    }
}
