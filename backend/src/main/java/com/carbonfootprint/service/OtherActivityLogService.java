package com.carbonfootprint.service;

import com.carbonfootprint.dto.activity.OtherActivityLogCreateDto;
import com.carbonfootprint.dto.activity.OtherActivityLogDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface OtherActivityLogService {
    OtherActivityLogDto createOtherActivityLog(String userEmail, OtherActivityLogCreateDto createDto);
    
    OtherActivityLogDto getOtherActivityLogById(Long id, String userEmail);
    
    Page<OtherActivityLogDto> searchOtherActivityLogs(
            String userEmail, 
            LocalDate startDate, 
            LocalDate endDate, 
            Pageable pageable);
            
    void deleteOtherActivityLog(Long id, String userEmail);
}
