package com.carbonfootprint.repository.admin;

import com.carbonfootprint.dto.admin.AdminMonitoringActivityDTO;
import com.carbonfootprint.dto.admin.AdminMonitoringFilterDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminActivityMonitorRepositoryCustom {
    Page<AdminMonitoringActivityDTO> findFilteredUnifiedActivities(AdminMonitoringFilterDTO filter, Pageable pageable);
}
