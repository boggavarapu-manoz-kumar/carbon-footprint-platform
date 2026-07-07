package com.carbonfootprint.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

/**
 * Highly optimized, immutable Data Transfer Object for Activity Rejection Requests.
 * Built for maximum security, immutability, and efficient deserialization.
 */
@Value
@Builder
@Jacksonized
public class ActivityRejectRequest {

    @NotBlank(message = "Rejection reason cannot be blank")
    @Size(max = 500, message = "Rejection reason must not exceed 500 characters")
    String rejectionReason;
}
