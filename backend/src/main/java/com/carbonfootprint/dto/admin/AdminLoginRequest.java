package com.carbonfootprint.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

/**
 * Highly optimized, immutable Data Transfer Object for Admin Login Requests.
 * Built for maximum security, immutability, and efficient deserialization.
 */
@Value
@Builder
@Jacksonized
public class AdminLoginRequest {

    @NotBlank(message = "Email is strictly required")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    String email;

    @NotBlank(message = "Password is strictly required")
    @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
    String password;

    @NotBlank(message = "Device fingerprint is strictly required")
    @Size(min = 16, max = 128, message = "Invalid device fingerprint length")
    String deviceFingerprint;
}
