package com.carbonfootprint.repository;

import com.carbonfootprint.entity.MonthlyLeaderboardHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MonthlyLeaderboardHistoryRepository extends JpaRepository<MonthlyLeaderboardHistory, Long> {
    List<MonthlyLeaderboardHistory> findByMonthStartDateAndMonthEndDateOrderByRankAsc(LocalDate monthStartDate, LocalDate monthEndDate);
}
