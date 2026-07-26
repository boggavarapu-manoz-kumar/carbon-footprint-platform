package com.carbonfootprint.repository;

import com.carbonfootprint.entity.YearlyLeaderboardHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface YearlyLeaderboardHistoryRepository extends JpaRepository<YearlyLeaderboardHistory, Long> {
    List<YearlyLeaderboardHistory> findByYearOrderByRankAsc(Integer year);
    java.util.Optional<YearlyLeaderboardHistory> findTopByUserOrderByRankAsc(com.carbonfootprint.entity.User user);
}
