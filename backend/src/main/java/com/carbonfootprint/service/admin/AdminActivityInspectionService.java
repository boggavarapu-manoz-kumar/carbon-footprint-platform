package com.carbonfootprint.service.admin;

import com.carbonfootprint.dto.activity.ActivityLogDto;
import com.carbonfootprint.dto.activity.OtherActivityLogDto;
import com.carbonfootprint.entity.admin.ActivityHistoryLog;
import com.carbonfootprint.repository.admin.ActivityHistoryLogRepository;
import com.carbonfootprint.service.ActivityLogService;
import com.carbonfootprint.service.OtherActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminActivityInspectionService {

    private final ActivityHistoryLogRepository historyLogRepository;
    private final ActivityLogService activityLogService;
    private final OtherActivityLogService otherActivityLogService;
    
    // Using admin email for bypass or we can fetch bypassing user email check.
    // Wait, the existing services require userEmail to verify ownership.
    // Since admin needs to fetch any activity, we might need a dedicated admin fetch in repo.
    // Let's check if there is an admin fetch method.
    // For now, I will use a direct repository call if the service enforces ownership, 
    // but we can try to fetch it via the custom monitor repo or directly injecting repositories.
    
    private final com.carbonfootprint.repository.ActivityLogRepository activityRepository;
    private final com.carbonfootprint.repository.OtherActivityLogRepository otherActivityRepository;
    private final com.carbonfootprint.mapper.ActivityLogMapper activityMapper;

    public Map<String, Object> inspectActivity(Long id, String logType) {
        Map<String, Object> result = new HashMap<>();
        
        Object currentData = null;
        if ("REGULAR".equalsIgnoreCase(logType)) {
            var entity = activityRepository.findById(id).orElseThrow(() -> new RuntimeException("Activity not found"));
            currentData = activityMapper.toDto(entity);
        } else if ("OTHER".equalsIgnoreCase(logType)) {
            var entity = otherActivityRepository.findById(id).orElseThrow(() -> new RuntimeException("Other Activity not found"));
            currentData = com.carbonfootprint.dto.activity.OtherActivityLogDto.builder()
                .id(entity.getId())
                .activityName(entity.getActivityName())
                .activityDescription(entity.getActivityDescription())
                .quantity(entity.getQuantity())
                .unit(entity.getUnit())
                .logDate(entity.getLogDate())
                .logTime(entity.getLogTime())
                .carbonValue(entity.getCarbonValue())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .build();
        }
        
        List<ActivityHistoryLog> history = historyLogRepository.findByActivityIdAndLogTypeOrderByTimestampDesc(id, logType.toUpperCase());
        
        result.put("currentData", currentData);
        result.put("history", history);
        
        return result;
    }
}
