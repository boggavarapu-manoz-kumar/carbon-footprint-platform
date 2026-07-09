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
    
    Long countByUserId(Long userId);
    
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

    @org.springframework.data.jpa.repository.Query("SELECT function('MONTH', a.logDate) as month, SUM(a.emissionValue) FROM ActivityLog a WHERE a.user.id = :userId AND function('YEAR', a.logDate) = :year GROUP BY function('MONTH', a.logDate) ORDER BY function('MONTH', a.logDate) ASC")
    java.util.List<Object[]> sumEmissionsGroupedByMonth(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("year") Integer year);

    @org.springframework.data.jpa.repository.Query("SELECT a.activityType.subCategory.category.code, SUM(a.emissionValue) FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.activityType.subCategory.category.code")
    java.util.List<Object[]> sumEmissionsByCategoryAndDateRange(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT function('YEAR', a.logDate) FROM ActivityLog a WHERE a.user.id = :userId ORDER BY function('YEAR', a.logDate) DESC")
    java.util.List<Integer> findDistinctYearsByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    // ─── DAILY ANALYTICS (Today) ─────────────────────────────────

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.createdAt >= :startOfDay AND a.createdAt <= :endOfDay")
    Long countActivitiesToday(
            @org.springframework.data.repository.query.Param("startOfDay") java.time.LocalDateTime startOfDay,
            @org.springframework.data.repository.query.Param("endOfDay") java.time.LocalDateTime endOfDay);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(a.emissionValue), 0) FROM ActivityLog a WHERE a.createdAt >= :startOfDay AND a.createdAt <= :endOfDay")
    java.math.BigDecimal sumEmissionsToday(
            @org.springframework.data.repository.query.Param("startOfDay") java.time.LocalDateTime startOfDay,
            @org.springframework.data.repository.query.Param("endOfDay") java.time.LocalDateTime endOfDay);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT a.user.id) FROM ActivityLog a WHERE a.createdAt >= :startOfDay AND a.createdAt <= :endOfDay")
    Long countActiveUsersToday(
            @org.springframework.data.repository.query.Param("startOfDay") java.time.LocalDateTime startOfDay,
            @org.springframework.data.repository.query.Param("endOfDay") java.time.LocalDateTime endOfDay);

    // ─── HOURLY BREAKDOWN ─────────────────────────────────────────

    @org.springframework.data.jpa.repository.Query("SELECT function('HOUR', a.createdAt), COUNT(a), COALESCE(SUM(a.emissionValue), 0), COUNT(DISTINCT a.user.id) FROM ActivityLog a WHERE a.createdAt >= :startOfDay AND a.createdAt <= :endOfDay GROUP BY function('HOUR', a.createdAt) ORDER BY function('HOUR', a.createdAt) ASC")
    java.util.List<Object[]> getHourlyBreakdown(
            @org.springframework.data.repository.query.Param("startOfDay") java.time.LocalDateTime startOfDay,
            @org.springframework.data.repository.query.Param("endOfDay") java.time.LocalDateTime endOfDay);
}

