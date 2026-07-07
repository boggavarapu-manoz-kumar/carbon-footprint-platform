package com.carbonfootprint.dto.auth;

import com.carbonfootprint.dto.UserDto;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

/**
 * Highly optimized, immutable Data Transfer Object for Authentication Responses.
 * Built for performance and thread-safety using Lombok @Value.
 */
@Value
@Builder
@Jacksonized
public class AuthenticationResponse {
    String accessToken;
    String refreshToken;
    UserDto user;
}
