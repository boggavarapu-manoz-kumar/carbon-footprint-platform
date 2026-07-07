package com.carbonfootprint.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Data Transfer Object for Admin Login Responses.
 * Immutable by design. Provides security tokens and session context.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminLoginResponse {

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("refresh_token")
    private String refreshToken;

    @JsonProperty("session_id")
    private Long sessionId;
}
