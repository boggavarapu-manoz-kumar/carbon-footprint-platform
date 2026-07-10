package com.carbonfootprint.repository;

import com.carbonfootprint.entity.Goal;
import com.carbonfootprint.entity.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    @Query("SELECT COUNT(g) FROM Goal g WHERE g.status = :status AND g.updatedAt >= :startOfDay AND g.updatedAt <= :endOfDay")
    Long countByStatusAndUpdatedAtBetween(
            @Param("status") GoalStatus status,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COUNT(g) FROM Goal g WHERE g.createdAt >= :startOfDay AND g.createdAt <= :endOfDay")
    Long countCreatedToday(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);
}
