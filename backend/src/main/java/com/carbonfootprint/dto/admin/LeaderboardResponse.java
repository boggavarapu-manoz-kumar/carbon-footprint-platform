package com.carbonfootprint.dto.admin;

import java.math.BigDecimal;

/**
 * Immutable Record DTO for Admin Leaderboard Response.
 */
public record LeaderboardResponse(
    Long userId,
    String username,
    BigDecimal totalEmissions
) {}
