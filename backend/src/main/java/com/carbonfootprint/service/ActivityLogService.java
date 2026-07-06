package com.carbonfootprint.service;

import com.carbonfootprint.dto.activity.ActivityLogCreateDto;
import com.carbonfootprint.dto.activity.ActivityLogDto;
import com.carbonfootprint.dto.activity.ActivityLogUpdateDto;
import com.carbonfootprint.entity.ActivityCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface ActivityLogService {
    ActivityLogDto createActivityLog(String userEmail, ActivityLogCreateDto createDto);
    List<ActivityLogDto> createActivityLogsBulk(String userEmail, List<ActivityLogCreateDto> createDtos);
    
    com.carbonfootprint.dto.activity.CalculationResponseDto calculateEmission(com.carbonfootprint.dto.activity.CalculationRequestDto requestDto);
    
    ActivityLogDto getActivityLogById(Long id, String userEmail);
    
    Page<ActivityLogDto> searchActivityLogs(
            String userEmail, 
            String categoryCode, 
            LocalDate startDate, 
            LocalDate endDate, 
            Pageable pageable);
            
    ActivityLogDto updateActivityLog(Long id, String userEmail, ActivityLogUpdateDto updateDto);
    void deleteActivityLog(Long id, String userEmail);
}
