package com.carbonfootprint.service.admin;

import com.carbonfootprint.dto.admin.AdminMonitoringActivityDTO;
import com.carbonfootprint.repository.admin.AdminActivityMonitorRepository;
import com.carbonfootprint.repository.admin.AdminMonitoringActivityProjection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.carbonfootprint.dto.admin.AdminMonitoringFilterDTO;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminActivityMonitorService {

    private final AdminActivityMonitorRepository monitorRepository;

    public Page<AdminMonitoringActivityDTO> getActivities(AdminMonitoringFilterDTO filter, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return monitorRepository.findFilteredUnifiedActivities(filter, pageable);
    }
}
