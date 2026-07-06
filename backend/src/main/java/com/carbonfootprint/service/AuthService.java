package com.carbonfootprint.service;

import com.carbonfootprint.dto.UserCreateDto;
import com.carbonfootprint.dto.auth.AuthenticationRequest;
import com.carbonfootprint.dto.auth.AuthenticationResponse;

public interface AuthService {
    AuthenticationResponse register(UserCreateDto request);

    AuthenticationResponse authenticate(AuthenticationRequest request);

    void requestPasswordReset(String email);

    void validatePasswordResetToken(String token);

    void resetPassword(String token, String newPassword);

    AuthenticationResponse refreshToken(String refreshToken);
}
