package com.carbonfootprint.dto.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

/**
 * Highly optimized, immutable Data Transfer Object for Platform Settings Update Requests.
 * Built for maximum security, immutability, and efficient deserialization.
 */
@Value
@Builder
@Jacksonized
public class PlatformSettingsUpdateRequest {

    @NotNull(message = "Maintenance mode flag is strictly required")
    Boolean maintenanceMode;

    @NotNull(message = "Max registrations per IP is strictly required")
    @Min(value = 1, message = "Max registrations per IP must be at least 1")
    @Max(value = 100, message = "Max registrations per IP cannot exceed 100")
    Integer maxRegistrationPerIp;
}
