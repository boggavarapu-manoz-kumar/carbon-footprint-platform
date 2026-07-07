package com.carbonfootprint.repository.admin;

import com.carbonfootprint.dto.admin.EmissionTrendResponse;
import com.carbonfootprint.dto.admin.LeaderboardResponse;
import com.carbonfootprint.entity.ActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminDashboardRepository extends JpaRepository<ActivityLog, Long> {

    @Query("SELECT COUNT(u) FROM User u")
    long countActiveUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate")
    long countNewRegistrations(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(a.emissionValue), 0) FROM ActivityLog a")
    BigDecimal sumTotalEmissions();

    @Query("SELECT COUNT(a) FROM ActivityLog a")
    long countTotalActivities();

    @Query("SELECT new com.carbonfootprint.dto.admin.EmissionTrendResponse(a.logDate, SUM(a.emissionValue)) " +
           "FROM ActivityLog a WHERE a.logDate >= :startDate GROUP BY a.logDate ORDER BY a.logDate ASC")
    List<EmissionTrendResponse> getEmissionTrends(@Param("startDate") LocalDate startDate);

    @Query("SELECT new com.carbonfootprint.dto.admin.LeaderboardResponse(u.id, u.username, SUM(a.emissionValue)) " +
           "FROM ActivityLog a JOIN a.user u " +
           "GROUP BY u.id, u.username ORDER BY SUM(a.emissionValue) DESC")
    List<LeaderboardResponse> getTopEmitters(Pageable pageable);
}
