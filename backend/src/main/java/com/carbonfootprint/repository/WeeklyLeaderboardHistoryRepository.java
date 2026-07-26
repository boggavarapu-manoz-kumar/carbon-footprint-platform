package com.carbonfootprint.repository;

import com.carbonfootprint.entity.WeeklyLeaderboardHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WeeklyLeaderboardHistoryRepository extends JpaRepository<WeeklyLeaderboardHistory, Long> {
    List<WeeklyLeaderboardHistory> findByWeekStartDateAndWeekEndDateOrderByRankAsc(LocalDate weekStartDate, LocalDate weekEndDate);
    
    java.util.Optional<WeeklyLeaderboardHistory> findTopByUserOrderByRankAsc(com.carbonfootprint.entity.User user);
    
    java.util.Optional<WeeklyLeaderboardHistory> findTopByUserOrderByWeekEndDateDesc(com.carbonfootprint.entity.User user);
}
