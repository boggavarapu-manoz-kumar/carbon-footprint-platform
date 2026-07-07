package com.carbonfootprint.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

/**
 * Highly optimized, immutable Data Transfer Object for Authentication Requests.
 * Built for performance, security, and thread-safety using Lombok @Value.
 */
@Value
@Builder
@Jacksonized
public class AuthenticationRequest {

    @NotBlank(message = "Email or Username is strictly required")
    @Size(min = 3, max = 100, message = "Identifier length must be between 3 and 100 characters")
    String loginIdentifier;

    @NotBlank(message = "Password is strictly required")
    @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
    String password;
}
