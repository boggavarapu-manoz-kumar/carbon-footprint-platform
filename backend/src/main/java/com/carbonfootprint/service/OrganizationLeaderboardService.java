package com.carbonfootprint.service;

import com.carbonfootprint.dto.leaderboard.LeaderboardEntryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrganizationLeaderboardService {
    /**
     * Returns a paginated leaderboard for active members of the given organization,
     * ranked by platform sustainability points for the specified timeframe.
     * The global leaderboard is completely independent.
     *
     * @param organizationId  target org (mandatory)
     * @param timeframe       WEEKLY | MONTHLY | YEARLY | ALL_TIME
     * @param currentUserEmail email of the requesting user (for "You" highlighting); may be null
     * @param pageable        pagination controls
     */
    Page<LeaderboardEntryDto> getOrganizationLeaderboard(
            Long organizationId, String timeframe, String currentUserEmail, Pageable pageable);
}

