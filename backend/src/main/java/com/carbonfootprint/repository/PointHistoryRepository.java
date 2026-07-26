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

    boolean existsByUserIdAndReason(Long userId, String reason);

    boolean existsByUserIdAndReasonAndTimestampGreaterThanEqual(Long userId, String reason, LocalDateTime timestamp);
    
    boolean existsByUserIdAndReferenceIdAndReason(Long userId, String referenceId, String reason);

    Optional<PointHistory> findByUserIdAndReferenceIdAndActionType(Long userId, String referenceId, String actionType);

    @Query("SELECT COUNT(p) FROM PointHistory p WHERE p.user.id = :userId AND p.actionType = :actionType AND p.timestamp >= :startOfDay AND p.status = 'AWARDED'")
    int countByUserIdAndActionTypeToday(@Param("userId") Long userId, @Param("actionType") String actionType, @Param("startOfDay") LocalDateTime startOfDay);
}
