package com.carbonfootprint.repository;

import com.carbonfootprint.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long>, JpaSpecificationExecutor<ActivityLog> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"activityType", "activityType.subCategory", "activityType.subCategory.category"})
    Optional<ActivityLog> findByIdAndUserId(Long id, Long userId);
    
    Optional<ActivityLog> findFirstByUserIdOrderByLogDateAsc(Long userId);
    
    Long countByUserId(Long userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.user.id = :userId AND a.activityType.subCategory.category.name = :category")
    Long countByUserIdAndCategory(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("category") String category);
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(a.emissionValue) FROM ActivityLog a WHERE a.user.id = :userId")
    java.math.BigDecimal sumEmissionsByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(a.emissionValue) FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate >= :startDate AND a.logDate <= :endDate")
    java.math.BigDecimal sumEmissionsByUserIdAndDateRange(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate >= :startDate AND a.logDate <= :endDate")
    Long countActivitiesByUserIdAndDateRange(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT a.activityType.subCategory.category.code, SUM(a.emissionValue) FROM ActivityLog a WHERE a.user.id = :userId GROUP BY a.activityType.subCategory.category.code")
    java.util.List<Object[]> sumEmissionsByCategory(@org.springframework.data.repository.query.Param("userId") Long userId);
    @org.springframework.data.jpa.repository.Query("SELECT function('DATE', a.logDate) as logDate, SUM(a.emissionValue) FROM ActivityLog a WHERE a.logDate >= :startDate GROUP BY function('DATE', a.logDate) ORDER BY function('DATE', a.logDate) ASC")
    java.util.List<Object[]> sumEmissionsGroupedByDateGlobal(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate);

    @org.springframework.data.jpa.repository.Query("SELECT function('MONTH', a.logDate), SUM(a.emissionValue), COUNT(a) FROM ActivityLog a WHERE function('YEAR', a.logDate) = :year GROUP BY function('MONTH', a.logDate) ORDER BY function('MONTH', a.logDate) ASC")
    java.util.List<Object[]> sumEmissionsGroupedByMonthGlobal(@org.springframework.data.repository.query.Param("year") Integer year);

    @org.springframework.data.jpa.repository.Query("SELECT a.activityType.subCategory.category.name, COUNT(a), SUM(a.emissionValue), AVG(a.emissionValue) FROM ActivityLog a GROUP BY a.activityType.subCategory.category.name ORDER BY SUM(a.emissionValue) DESC")
    java.util.List<Object[]> getActivityAnalyticsByCategory();

    @org.springframework.data.jpa.repository.Query("SELECT a.user.id, a.user.username, a.user.firstName, a.user.lastName, SUM(a.emissionValue), COUNT(a) FROM ActivityLog a GROUP BY a.user.id, a.user.username, a.user.firstName, a.user.lastName ORDER BY SUM(a.emissionValue) DESC")
    java.util.List<Object[]> getLeaderboardAnalytics(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(a.emissionValue) FROM ActivityLog a WHERE a.logDate >= :startDate AND a.logDate <= :endDate")
    java.math.BigDecimal sumEmissionsInRange(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.logDate >= :startDate AND a.logDate <= :endDate")
    Long countActivitiesInRange(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT a.user.id) FROM ActivityLog a WHERE a.logDate >= :startDate AND a.logDate <= :endDate")
    Long countActiveUsersInRange(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT function('DATE', a.logDate) as logDate, COUNT(a) as count FROM ActivityLog a WHERE a.logDate >= :startDate GROUP BY function('DATE', a.logDate) ORDER BY function('DATE', a.logDate) ASC")
    java.util.List<Object[]> countActivitiesGroupedByDate(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate);
    
    @org.springframework.data.jpa.repository.Query("SELECT a.activityType.subCategory.category.name, SUM(a.emissionValue), COUNT(a) FROM ActivityLog a GROUP BY a.activityType.subCategory.category.name")
    java.util.List<Object[]> sumEmissionsAndCountByCategory();
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(a.emissionValue) FROM ActivityLog a")
    java.math.BigDecimal sumAllEmissions();
    @org.springframework.data.jpa.repository.Query("SELECT function('DATE', a.logDate) as logDate, SUM(a.emissionValue) FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY function('DATE', a.logDate) ORDER BY function('DATE', a.logDate) ASC")
    java.util.List<Object[]> sumEmissionsGroupedByDate(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate = :logDate")
    java.util.List<ActivityLog> findByUserIdAndLogDate(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("logDate") java.time.LocalDate logDate);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate >= :startDate AND a.logDate <= :endDate")
    java.util.List<ActivityLog> findByUserIdAndDateBetween(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT function('MONTH', a.logDate) as month, SUM(a.emissionValue) FROM ActivityLog a WHERE a.user.id = :userId AND function('YEAR', a.logDate) = :year GROUP BY function('MONTH', a.logDate) ORDER BY function('MONTH', a.logDate) ASC")
    java.util.List<Object[]> sumEmissionsGroupedByMonth(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("year") Integer year);

    @org.springframework.data.jpa.repository.Query("SELECT a.activityType.subCategory.category.name, SUM(a.emissionValue) FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.activityType.subCategory.category.name")
    java.util.List<Object[]> sumEmissionsByCategoryAndDateRange(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT a.activityType.subCategory.category.name, SUM(a.emissionValue), COUNT(a) FROM ActivityLog a WHERE a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.activityType.subCategory.category.name")
    java.util.List<Object[]> sumEmissionsByCategoryAndDateRangeGlobal(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT function('YEAR', a.logDate) FROM ActivityLog a WHERE a.user.id = :userId ORDER BY function('YEAR', a.logDate) DESC")
    java.util.List<Integer> findDistinctYearsByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT function('YEAR', a.createdAt) FROM ActivityLog a ORDER BY function('YEAR', a.createdAt) DESC")
    java.util.List<Integer> findAvailableYearsGlobal();

    // ─── DAILY ANALYTICS (Today) ─────────────────────────────────

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.logDate = :targetDate")
    Long countActivitiesToday(@org.springframework.data.repository.query.Param("targetDate") java.time.LocalDate targetDate);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(a.emissionValue), 0) FROM ActivityLog a WHERE a.logDate = :targetDate")
    java.math.BigDecimal sumEmissionsToday(@org.springframework.data.repository.query.Param("targetDate") java.time.LocalDate targetDate);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT a.user.id) FROM ActivityLog a WHERE a.logDate = :targetDate")
    Long countActiveUsersToday(@org.springframework.data.repository.query.Param("targetDate") java.time.LocalDate targetDate);

    // ─── HOURLY BREAKDOWN (IST Timezone) ─────────────────────────

    @org.springframework.data.jpa.repository.Query("SELECT function('HOUR', function('CONVERT_TZ', a.createdAt, '+00:00', '+05:30')), COUNT(a), COALESCE(SUM(a.emissionValue), 0), COUNT(DISTINCT a.user.id) FROM ActivityLog a WHERE a.logDate = :targetDate GROUP BY function('HOUR', function('CONVERT_TZ', a.createdAt, '+00:00', '+05:30')) ORDER BY function('HOUR', function('CONVERT_TZ', a.createdAt, '+00:00', '+05:30')) ASC")
    java.util.List<Object[]> getHourlyBreakdown(@org.springframework.data.repository.query.Param("targetDate") java.time.LocalDate targetDate);

    // ─── WEEKLY BREAKDOWN ─────────────────────────────────────────

    @org.springframework.data.jpa.repository.Query("SELECT function('DATE', a.createdAt), COUNT(a), COALESCE(SUM(a.emissionValue), 0), COUNT(DISTINCT a.user.id) FROM ActivityLog a WHERE a.createdAt >= :startOfWeek AND a.createdAt <= :endOfWeek GROUP BY function('DATE', a.createdAt) ORDER BY function('DATE', a.createdAt) ASC")
    java.util.List<Object[]> getWeeklyBreakdown(
            @org.springframework.data.repository.query.Param("startOfWeek") java.time.LocalDateTime startOfWeek,
            @org.springframework.data.repository.query.Param("endOfWeek") java.time.LocalDateTime endOfWeek);
    @org.springframework.data.jpa.repository.Query("""
        SELECT new com.carbonfootprint.dto.FootprintAggregationProjectionDTO(
            a.logDate,
            c.name,
            SUM(a.emissionValue),
            COUNT(a.id)
        )
        FROM ActivityLog a
        JOIN a.activityType t
        JOIN t.subCategory sc
        JOIN sc.category c
        WHERE a.user.id = :userId
          AND a.logDate >= :startDate
          AND a.logDate <= :endDate
        GROUP BY a.logDate, c.name
        ORDER BY a.logDate ASC
    """)
    java.util.List<com.carbonfootprint.dto.FootprintAggregationProjectionDTO> getOptimizedAggregations(
        @org.springframework.data.repository.query.Param("userId") Long userId, 
        @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, 
        @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate
    );

    @org.springframework.data.jpa.repository.Query("SELECT a.activityType.name, a.activityType.subCategory.category.name, SUM(a.emissionValue), COUNT(a) FROM ActivityLog a WHERE a.user.id = :userId GROUP BY a.activityType.name, a.activityType.subCategory.category.name ORDER BY SUM(a.emissionValue) DESC")
    java.util.List<Object[]> getTopEmissionActivitiesByUser(@org.springframework.data.repository.query.Param("userId") Long userId);
    @org.springframework.data.jpa.repository.Query("SELECT MAX(a.createdAt) FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate >= :startDate AND a.logDate <= :endDate")
    java.time.LocalDateTime getMaxCreatedAtByUserIdAndDateRange(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    // --- BENCHMARKING QUERIES ---

    @org.springframework.data.jpa.repository.Query("SELECT a.user.id, SUM(a.emissionValue) FROM ActivityLog a WHERE a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.user.id")
    java.util.List<Object[]> sumEmissionsGroupedByUserAndDateRange(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT a.activityType.subCategory.category.name, a.user.id, SUM(a.emissionValue) FROM ActivityLog a WHERE a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.activityType.subCategory.category.name, a.user.id")
    java.util.List<Object[]> sumEmissionsGroupedByCategoryAndUserAndDateRange(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    // --- LEADERBOARD QUERIES ---

    @org.springframework.data.jpa.repository.Query("SELECT a.user.id, COUNT(a) FROM ActivityLog a GROUP BY a.user.id")
    java.util.List<Object[]> countActivitiesGroupedByUser();

    @org.springframework.data.jpa.repository.Query("SELECT a.user.id, COUNT(a) FROM ActivityLog a WHERE a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.user.id")
    java.util.List<Object[]> countActivitiesGroupedByUserAndDateRange(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT a.user.id, COUNT(DISTINCT function('WEEK', a.logDate)) FROM ActivityLog a GROUP BY a.user.id")
    java.util.List<Object[]> countActiveWeeksGroupedByUser();

    @org.springframework.data.jpa.repository.Query("SELECT a.user.id, COUNT(DISTINCT function('WEEK', a.logDate)) FROM ActivityLog a WHERE a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.user.id")
    java.util.List<Object[]> countActiveWeeksGroupedByUserAndDateRange(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    // --- LEADERBOARD QUERIES (CATEGORY FILTERED) ---

    @org.springframework.data.jpa.repository.Query("SELECT a.user.id, COUNT(a) FROM ActivityLog a WHERE a.activityType.subCategory.category.name = :category GROUP BY a.user.id")
    java.util.List<Object[]> countActivitiesGroupedByUserAndCategory(@org.springframework.data.repository.query.Param("category") String category);

    @org.springframework.data.jpa.repository.Query("SELECT a.user.id, COUNT(a) FROM ActivityLog a WHERE a.activityType.subCategory.category.name = :category AND a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.user.id")
    java.util.List<Object[]> countActivitiesGroupedByUserAndDateRangeAndCategory(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate, @org.springframework.data.repository.query.Param("category") String category);

    @org.springframework.data.jpa.repository.Query("SELECT a.user.id, COUNT(DISTINCT function('WEEK', a.logDate)) FROM ActivityLog a WHERE a.activityType.subCategory.category.name = :category GROUP BY a.user.id")
    java.util.List<Object[]> countActiveWeeksGroupedByUserAndCategory(@org.springframework.data.repository.query.Param("category") String category);

    @org.springframework.data.jpa.repository.Query("SELECT a.user.id, COUNT(DISTINCT function('WEEK', a.logDate)) FROM ActivityLog a WHERE a.activityType.subCategory.category.name = :category AND a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.user.id")
    java.util.List<Object[]> countActiveWeeksGroupedByUserAndDateRangeAndCategory(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate, @org.springframework.data.repository.query.Param("category") String category);

    @org.springframework.data.jpa.repository.Query("SELECT a.user.id, SUM(a.emissionValue) FROM ActivityLog a WHERE a.activityType.subCategory.category.name = :category AND a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.user.id")
    java.util.List<Object[]> sumEmissionsGroupedByUserAndDateRangeAndCategory(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate, @org.springframework.data.repository.query.Param("category") String category);

    @org.springframework.data.jpa.repository.Query("SELECT a.user.id, SUM(a.emissionValue) FROM ActivityLog a WHERE a.activityType.subCategory.category.name = :category GROUP BY a.user.id")
    java.util.List<Object[]> sumEmissionsGroupedByUserAndCategory(@org.springframework.data.repository.query.Param("category") String category);

    // --- QUICK LOG QUERIES ---

    @org.springframework.data.jpa.repository.Query("SELECT a.activityType.id, a.dynamicInputs, a.activityType.name, a.activityType.subCategory.category.name, a.activityType.subCategory.category.code, a.activityType.code, MAX(a.logDate), COUNT(a), a.unit, AVG(a.quantity) " +
           "FROM ActivityLog a WHERE a.user.id = :userId " +
           "GROUP BY a.activityType.id, a.dynamicInputs, a.activityType.name, a.activityType.subCategory.category.name, a.activityType.subCategory.category.code, a.activityType.code, a.unit " +
           "ORDER BY COUNT(a) DESC, MAX(a.logDate) DESC")
    java.util.List<Object[]> getFrequentlyUsedActivities(@org.springframework.data.repository.query.Param("userId") Long userId, org.springframework.data.domain.Pageable pageable);
    
    @org.springframework.data.jpa.repository.Query("SELECT a.activityType.id, a.dynamicInputs, a.activityType.name, a.activityType.subCategory.category.name, a.activityType.subCategory.category.code, a.activityType.code, MAX(a.logDate), COUNT(a), a.unit, AVG(a.quantity) " +
           "FROM ActivityLog a WHERE a.user.id = :userId " +
           "GROUP BY a.activityType.id, a.dynamicInputs, a.activityType.name, a.activityType.subCategory.category.name, a.activityType.subCategory.category.code, a.activityType.code, a.unit " +
           "ORDER BY MAX(a.logDate) DESC")
    java.util.List<Object[]> getRecentlyUsedActivities(@org.springframework.data.repository.query.Param("userId") Long userId, org.springframework.data.domain.Pageable pageable);

    // --- ORGANIZATION ANALYTICS QUERIES ---
    @org.springframework.data.jpa.repository.Query("SELECT SUM(a.emissionValue) FROM ActivityLog a JOIN OrganizationMembership m ON a.user.id = m.user.id WHERE m.organization.id = :orgId AND m.status = 'ACTIVE'")
    java.math.BigDecimal sumEmissionsByOrganizationId(@org.springframework.data.repository.query.Param("orgId") Long orgId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(a.emissionValue) FROM ActivityLog a JOIN OrganizationMembership m ON a.user.id = m.user.id WHERE m.organization.id = :orgId AND m.status = 'ACTIVE' AND a.logDate >= :startDate AND a.logDate <= :endDate")
    java.math.BigDecimal sumEmissionsByOrganizationIdAndDateRange(@org.springframework.data.repository.query.Param("orgId") Long orgId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT a.activityType.subCategory.category.name, SUM(a.emissionValue) FROM ActivityLog a JOIN OrganizationMembership m ON a.user.id = m.user.id WHERE m.organization.id = :orgId AND m.status = 'ACTIVE' AND a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.activityType.subCategory.category.name")
    java.util.List<Object[]> sumEmissionsGroupedByCategoryAndOrgAndDateRange(@org.springframework.data.repository.query.Param("orgId") Long orgId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT a.logDate, SUM(a.emissionValue) FROM ActivityLog a JOIN OrganizationMembership m ON a.user.id = m.user.id WHERE m.organization.id = :orgId AND m.status = 'ACTIVE' AND a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.logDate")
    java.util.List<Object[]> sumEmissionsGroupedByDateAndOrgAndDateRange(@org.springframework.data.repository.query.Param("orgId") Long orgId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);
}
