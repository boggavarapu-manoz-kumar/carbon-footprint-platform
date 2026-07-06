package com.carbonfootprint.repository;

import com.carbonfootprint.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long>, JpaSpecificationExecutor<ActivityLog> {
    Optional<ActivityLog> findByIdAndUserId(Long id, Long userId);
    
    Long countByUserId(Long userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(a.emissionValue) FROM ActivityLog a WHERE a.user.id = :userId")
    java.math.BigDecimal sumEmissionsByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(a.emissionValue) FROM ActivityLog a WHERE a.user.id = :userId AND a.logDate >= :startDate AND a.logDate <= :endDate")
    java.math.BigDecimal sumEmissionsByUserIdAndDateRange(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);
    
    @org.springframework.data.jpa.repository.Query("SELECT a.activityType.subCategory.category.code, SUM(a.emissionValue) FROM ActivityLog a WHERE a.user.id = :userId GROUP BY a.activityType.subCategory.category.code")
    java.util.List<Object[]> sumEmissionsByCategory(@org.springframework.data.repository.query.Param("userId") Long userId);
}
