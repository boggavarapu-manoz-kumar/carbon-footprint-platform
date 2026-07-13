package com.carbonfootprint.repository.admin;

import com.carbonfootprint.entity.admin.ActivityHistoryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityHistoryLogRepository extends JpaRepository<ActivityHistoryLog, Long> {
    List<ActivityHistoryLog> findByActivityIdAndLogTypeOrderByTimestampDesc(Long activityId, String logType);
}
