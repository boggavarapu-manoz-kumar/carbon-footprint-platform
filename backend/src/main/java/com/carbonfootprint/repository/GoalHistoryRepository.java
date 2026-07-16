package com.carbonfootprint.repository;

import com.carbonfootprint.entity.GoalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalHistoryRepository extends JpaRepository<GoalHistory, Long> {
    List<GoalHistory> findByGoalIdOrderByChangedAtDesc(Long goalId);
    void deleteByGoalId(Long goalId);
}
