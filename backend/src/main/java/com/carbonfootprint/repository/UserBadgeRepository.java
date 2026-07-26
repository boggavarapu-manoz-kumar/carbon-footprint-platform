package com.carbonfootprint.repository;

import com.carbonfootprint.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    boolean existsByUserAndBadge(com.carbonfootprint.entity.User user, com.carbonfootprint.entity.Badge badge);
    List<UserBadge> findByUserId(Long userId);

    @Query("SELECT COUNT(b) FROM UserBadge b WHERE b.awardedAt >= :startOfDay AND b.awardedAt <= :endOfDay")
    Long countBadgesEarnedToday(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT function('DATE', b.awardedAt), COUNT(b) FROM UserBadge b WHERE b.awardedAt >= :startDate AND b.awardedAt <= :endDate GROUP BY function('DATE', b.awardedAt)")
    java.util.List<Object[]> getDailyBadgeBreakdown(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT b.badge.name, COUNT(b), b.badge.imageUrl FROM UserBadge b GROUP BY b.badge.name, b.badge.imageUrl ORDER BY COUNT(b) DESC")
    List<Object[]> findMostEarnedBadges(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT b.badge.name, COUNT(b), b.badge.imageUrl FROM UserBadge b GROUP BY b.badge.name, b.badge.imageUrl ORDER BY COUNT(b) ASC")
    List<Object[]> findLeastEarnedBadges(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT function('MONTH', b.awardedAt), COUNT(b) FROM UserBadge b WHERE function('YEAR', b.awardedAt) = :year GROUP BY function('MONTH', b.awardedAt)")
    List<Object[]> getMonthlyBadgeAwards(@Param("year") Integer year);

    @Query("SELECT function('YEAR', b.awardedAt), COUNT(b) FROM UserBadge b GROUP BY function('YEAR', b.awardedAt)")
    List<Object[]> getYearlyBadgeAwards();

    @Query("SELECT b.user.id, COUNT(b) FROM UserBadge b GROUP BY b.user.id")
    java.util.List<Object[]> countBadgesGroupedByUser();

    @Query("SELECT b.user.id, COUNT(b) FROM UserBadge b WHERE b.awardedAt >= :startDate AND b.awardedAt <= :endDate GROUP BY b.user.id")
    java.util.List<Object[]> countBadgesGroupedByUserAndDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
