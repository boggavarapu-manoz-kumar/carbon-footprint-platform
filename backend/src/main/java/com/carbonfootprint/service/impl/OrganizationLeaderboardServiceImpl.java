package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.leaderboard.LeaderboardEntryDto;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.PointHistoryRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.OrganizationLeaderboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Organization Leaderboard — completely independent from the Global Leaderboard.
 *
 * Ranking algorithm: uses the platform's canonical sustainability points engine
 * (PointHistory table), exactly as the global leaderboard does, but:
 *   - scoped to ACTIVE members of the given organization only
 *   - scoped to the requested timeframe (WEEKLY / MONTHLY / YEARLY / ALL_TIME)
 *   - sorted and paginated at the database level (no Java-side sort of all members)
 *
 * Privacy: exposes firstName, lastName, username, profilePictureUrl only.
 * No raw emission values, no personal activity details.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrganizationLeaderboardServiceImpl implements OrganizationLeaderboardService {

    private final PointHistoryRepository pointHistoryRepository;
    private final UserRepository userRepository;

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public Page<LeaderboardEntryDto> getOrganizationLeaderboard(
            Long organizationId, String timeframe, String currentUserEmail, Pageable pageable) {

        log.info("Org Leaderboard: orgId={}, timeframe={}, page={}, size={}",
                organizationId, timeframe, pageable.getPageNumber(), pageable.getPageSize());

        // 1. Resolve timeframe → date range
        LocalDateTime[] range = resolveDateRange(timeframe);
        LocalDateTime startDate = range[0];
        LocalDateTime endDate   = range[1];

        // 2. Single DB call — sorted + paginated at SQL level
        Page<Object[]> rawPage = pointHistoryRepository
                .sumPointsGroupedByOrgMemberAndDateRange(organizationId, startDate, endDate, pageable);

        if (rawPage.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        // 3. Batch-fetch user display info for the returned user IDs only
        List<Long> userIds = rawPage.getContent().stream()
                .map(row -> ((Number) row[0]).longValue())
                .collect(Collectors.toList());

        Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // 4. Resolve current user ID (for "You" highlighting)
        Long currentUserId = null;
        if (currentUserEmail != null) {
            currentUserId = userRepository.findByEmail(currentUserEmail)
                    .map(User::getId).orElse(null);
        }

        // 5. Compute rank offset so rank is correct across pages
        long rankOffset = pageable.getOffset(); // e.g. page 1 size 25 → offset = 25

        // 6. Build DTOs — rank is purely positional within sorted result
        List<LeaderboardEntryDto> entries = rawPage.getContent().stream()
                .map(row -> {
                    long userId = ((Number) row[0]).longValue();
                    long pts    = ((Number) row[1]).longValue();
                    User user   = userMap.get(userId);

                    // Safe display fields — no PII beyond name/username
                    String displayUsername = user != null && user.getUsername() != null
                            ? user.getUsername()
                            : (user != null ? user.getEmail().split("@")[0] : "member");

                    return LeaderboardEntryDto.builder()
                            .userId(userId)
                            .firstName(user != null ? user.getFirstName() : "")
                            .lastName(user != null ? user.getLastName() : "")
                            .username(displayUsername)
                            .profilePictureUrl(user != null ? user.getProfilePictureUrl() : null)
                            .totalSustainabilityScore(pts)
                            // Sub-scores set to 0 — consistent with ScoringEngineServiceImpl
                            .participationScore(0L)
                            .goalScore(0L)
                            .badgeScore(0L)
                            .carbonReductionScore(0L)
                            .consistencyScore(0L)
                            .improvementScore(0L)
                            .build();
                })
                .collect(Collectors.toList());

        // 7. Assign sequential rank (DB-ordered, offset-aware)
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank((int) (rankOffset + i + 1));
        }

        // 8. Inject current user's exact org rank if they are not on this page
        //    (done at controller level — service just returns the page cleanly)

        return new PageImpl<>(entries, pageable, rawPage.getTotalElements());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Resolves a timeframe string to [startDate, endDate] for PointHistory queries.
     * Returns [null, null] for ALL_TIME (no date filter).
     */
    private LocalDateTime[] resolveDateRange(String timeframe) {
        LocalDate today = LocalDate.now();
        if (timeframe == null) timeframe = "ALL_TIME";

        return switch (timeframe.toUpperCase()) {
            case "WEEKLY" -> new LocalDateTime[]{
                    today.minusDays(today.getDayOfWeek().getValue() - 1).atStartOfDay(),
                    today.atTime(23, 59, 59)
            };
            case "MONTHLY" -> new LocalDateTime[]{
                    today.withDayOfMonth(1).atStartOfDay(),
                    today.withDayOfMonth(today.lengthOfMonth()).atTime(23, 59, 59)
            };
            case "YEARLY" -> new LocalDateTime[]{
                    today.withDayOfYear(1).atStartOfDay(),
                    LocalDate.of(today.getYear(), 12, 31).atTime(23, 59, 59)
            };
            default -> new LocalDateTime[]{null, null}; // ALL_TIME
        };
    }
}
