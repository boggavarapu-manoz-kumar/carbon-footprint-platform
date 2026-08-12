package com.carbonfootprint.repository;

import com.carbonfootprint.entity.PointHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {

    List<PointHistory> findByUserIdOrderByTimestampDesc(Long userId);

    org.springframework.data.domain.Page<PointHistory> findByUserIdOrderByTimestampDesc(Long userId, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.points), 0) FROM PointHistory p WHERE p.user.id = :userId")
    Long getTotalPointsByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(p.points), 0) FROM PointHistory p WHERE p.user.id = :userId AND p.timestamp >= :startDate")
    Long getPointsByUserIdSince(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(p.points), 0) FROM PointHistory p WHERE p.user.id = :userId AND p.timestamp >= :startDate AND p.timestamp <= :endDate")
    Long getPointsByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT p.user.id, COALESCE(SUM(p.points), 0) FROM PointHistory p WHERE p.timestamp >= :startDate AND p.timestamp <= :endDate GROUP BY p.user.id")
    List<Object[]> sumPointsGroupedByUserAndDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT p.user.id, COALESCE(SUM(p.points), 0) FROM PointHistory p GROUP BY p.user.id")
    List<Object[]> sumPointsGroupedByUser();

    // --- ORGANIZATION LEADERBOARD QUERIES ---

    /**
     * Returns [userId, totalPoints] for all ACTIVE members of an org, optionally date-scoped.
     * Pageable enforces DB-level top-N (no in-memory sorting or loading of all rows).
     * Pass null for both dates to get all-time scores.
     */
    @Query("SELECT p.user.id, COALESCE(SUM(p.points), 0) AS pts " +
           "FROM PointHistory p " +
           "JOIN OrganizationMembership m ON p.user.id = m.user.id " +
           "WHERE m.organization.id = :orgId AND m.status = 'ACTIVE' " +
           "AND (:startDate IS NULL OR p.timestamp >= :startDate) " +
           "AND (:endDate IS NULL OR p.timestamp <= :endDate) " +
           "GROUP BY p.user.id " +
           "ORDER BY pts DESC")
    org.springframework.data.domain.Page<Object[]> sumPointsGroupedByOrgMemberAndDateRange(
            @Param("orgId") Long orgId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            org.springframework.data.domain.Pageable pageable);

    /**
     * Returns the total points for a specific user within an org scope, optionally date-scoped.
     * Used to compute the current user's rank without fetching the full board.
     */
    @Query("SELECT COALESCE(SUM(p.points), 0) " +
           "FROM PointHistory p " +
           "JOIN OrganizationMembership m ON p.user.id = m.user.id " +
           "WHERE p.user.id = :userId AND m.organization.id = :orgId AND m.status = 'ACTIVE' " +
           "AND (:startDate IS NULL OR p.timestamp >= :startDate) " +
           "AND (:endDate IS NULL OR p.timestamp <= :endDate)")
    Long sumPointsForUserInOrg(
            @Param("userId") Long userId,
            @Param("orgId") Long orgId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Counts how many ACTIVE org members have strictly more points than the given score.
     * Adding 1 to this gives the current user's rank (even if they fall off the paginated view).
     */
    @Query("SELECT COUNT(DISTINCT m.user.id) " +
           "FROM OrganizationMembership m " +
           "WHERE m.organization.id = :orgId AND m.status = 'ACTIVE' " +
           "AND (SELECT COALESCE(SUM(p2.points), 0) FROM PointHistory p2 " +
           "     WHERE p2.user.id = m.user.id " +
           "     AND (:startDate IS NULL OR p2.timestamp >= :startDate) " +
           "     AND (:endDate IS NULL OR p2.timestamp <= :endDate)) > :userScore")
    long countOrgMembersWithMorePoints(
            @Param("orgId") Long orgId,
            @Param("userScore") Long userScore,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    boolean existsByUserIdAndReason(Long userId, String reason);

    boolean existsByUserIdAndReasonAndTimestampGreaterThanEqual(Long userId, String reason, LocalDateTime timestamp);
    
    boolean existsByUserIdAndReferenceIdAndReason(Long userId, String referenceId, String reason);

    Optional<PointHistory> findByUserIdAndReferenceIdAndActionType(Long userId, String referenceId, String actionType);

    @Query("SELECT COUNT(p) FROM PointHistory p WHERE p.user.id = :userId AND p.actionType = :actionType AND p.timestamp >= :startOfDay AND p.status = 'AWARDED'")
    int countByUserIdAndActionTypeToday(@Param("userId") Long userId, @Param("actionType") String actionType, @Param("startOfDay") LocalDateTime startOfDay);
}
