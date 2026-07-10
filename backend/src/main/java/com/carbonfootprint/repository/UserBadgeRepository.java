package com.carbonfootprint.repository;

import com.carbonfootprint.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    @Query("SELECT COUNT(b) FROM UserBadge b WHERE b.awardedAt >= :startOfDay AND b.awardedAt <= :endOfDay")
    Long countBadgesEarnedToday(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);
}
