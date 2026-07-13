package com.carbonfootprint.repository;

import com.carbonfootprint.dto.activity.UserActivityHistoryDTO;
import com.carbonfootprint.dto.activity.UserActivityHistoryFilterDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserActivityMonitorRepositoryCustom {
    Page<UserActivityHistoryDTO> findFilteredUserActivities(String userEmail, UserActivityHistoryFilterDTO filter, Pageable pageable);
}
