package com.carbonfootprint.dto.admin;

import java.time.LocalDateTime;

/**
 * Immutable DTO representing a user entry in the Admin management view.
 */
public record AdminUserResponse(
    Long id,
    String firstName,
    String lastName,
    String username,
    String email,
    String role,
    String status,
    String provider,
    String gender,
    String mobileNumber,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
