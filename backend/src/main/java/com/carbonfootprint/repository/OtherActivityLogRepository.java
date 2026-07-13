package com.carbonfootprint.repository;

import com.carbonfootprint.entity.OtherActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface OtherActivityLogRepository extends JpaRepository<OtherActivityLog, Long> {
    
    Optional<OtherActivityLog> findByIdAndUserEmail(Long id, String email);

    @Query("SELECT o FROM OtherActivityLog o WHERE o.user.email = :email AND " +
           "(:startDate IS NULL OR o.logDate >= :startDate) AND " +
           "(:endDate IS NULL OR o.logDate <= :endDate)")
    Page<OtherActivityLog> findByUserEmailAndDateRange(
            String email, 
            LocalDate startDate, 
            LocalDate endDate, 
            Pageable pageable);

    @Query("SELECT o FROM OtherActivityLog o WHERE o.user.id = :userId")
    java.util.List<OtherActivityLog> findByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    @Query("SELECT SUM(o.carbonValue) FROM OtherActivityLog o WHERE o.user.id = :userId AND o.logDate >= :startDate AND o.logDate <= :endDate")
    java.math.BigDecimal sumEmissionsByUserIdAndDateRange(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @Query("SELECT COUNT(o) FROM OtherActivityLog o WHERE o.user.id = :userId AND o.logDate >= :startDate AND o.logDate <= :endDate")
    Long countActivitiesByUserIdAndDateRange(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @Query("SELECT function('DATE', o.logDate) as logDate, SUM(o.carbonValue) FROM OtherActivityLog o WHERE o.user.id = :userId AND o.logDate >= :startDate AND o.logDate <= :endDate GROUP BY function('DATE', o.logDate) ORDER BY function('DATE', o.logDate) ASC")
    java.util.List<Object[]> sumEmissionsGroupedByDate(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @Query("SELECT function('MONTH', o.logDate) as month, SUM(o.carbonValue) FROM OtherActivityLog o WHERE o.user.id = :userId AND function('YEAR', o.logDate) = :year GROUP BY function('MONTH', o.logDate) ORDER BY function('MONTH', o.logDate) ASC")
    java.util.List<Object[]> sumEmissionsGroupedByMonth(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("year") Integer year);

    @Query("SELECT DISTINCT function('YEAR', o.logDate) FROM OtherActivityLog o WHERE o.user.id = :userId ORDER BY function('YEAR', o.logDate) DESC")
    java.util.List<Integer> findDistinctYearsByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    @Query("SELECT o FROM OtherActivityLog o WHERE o.user.id = :userId AND o.logDate = :logDate")
    java.util.List<OtherActivityLog> findByUserIdAndLogDate(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("logDate") java.time.LocalDate logDate);

    // ─── ADMIN GLOBAL QUERIES ─────────────────────────────────────

    @Query("SELECT COUNT(o) FROM OtherActivityLog o WHERE o.logDate >= :startDate AND o.logDate <= :endDate")
    Long countGlobalActivitiesInRange(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @Query("SELECT SUM(o.carbonValue) FROM OtherActivityLog o WHERE o.logDate >= :startDate AND o.logDate <= :endDate")
    java.math.BigDecimal sumGlobalEmissionsInRange(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @Query("SELECT o.activityName, COUNT(o), SUM(o.carbonValue) FROM OtherActivityLog o GROUP BY o.activityName ORDER BY COUNT(o) DESC")
    java.util.List<Object[]> findTopActivitiesByUsage(Pageable pageable);

    @Query("SELECT o.activityName, COUNT(o), SUM(o.carbonValue) FROM OtherActivityLog o GROUP BY o.activityName ORDER BY SUM(o.carbonValue) DESC")
    java.util.List<Object[]> findTopActivitiesByEmissions(Pageable pageable);
    
    @Query("SELECT o.activityName, COUNT(o), SUM(o.carbonValue) FROM OtherActivityLog o WHERE o.logDate >= :startDate AND o.logDate <= :endDate GROUP BY o.activityName ORDER BY COUNT(o) DESC")
    java.util.List<Object[]> findTopActivitiesByUsageInRange(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate, Pageable pageable);

    @Query("SELECT o.activityName, COUNT(o), SUM(o.carbonValue) FROM OtherActivityLog o WHERE o.logDate >= :startDate AND o.logDate <= :endDate GROUP BY o.activityName ORDER BY SUM(o.carbonValue) DESC")
    java.util.List<Object[]> findTopActivitiesByEmissionsInRange(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate, Pageable pageable);

    @Query("SELECT function('DATE', o.createdAt), COUNT(o), COALESCE(SUM(o.carbonValue), 0), COUNT(DISTINCT o.user.id) FROM OtherActivityLog o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate GROUP BY function('DATE', o.createdAt) ORDER BY function('DATE', o.createdAt) ASC")
    java.util.List<Object[]> getDailyBreakdownGlobal(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @Query("SELECT function('HOUR', function('CONVERT_TZ', o.createdAt, '+00:00', '+05:30')), COUNT(o), COALESCE(SUM(o.carbonValue), 0), COUNT(DISTINCT o.user.id) FROM OtherActivityLog o WHERE o.logDate = :targetDate GROUP BY function('HOUR', function('CONVERT_TZ', o.createdAt, '+00:00', '+05:30')) ORDER BY function('HOUR', function('CONVERT_TZ', o.createdAt, '+00:00', '+05:30')) ASC")
    java.util.List<Object[]> getHourlyBreakdownGlobal(@org.springframework.data.repository.query.Param("targetDate") java.time.LocalDate targetDate);
}
