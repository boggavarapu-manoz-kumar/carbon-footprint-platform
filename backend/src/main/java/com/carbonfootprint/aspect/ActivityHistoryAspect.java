package com.carbonfootprint.aspect;

import com.carbonfootprint.dto.activity.ActivityLogDto;
import com.carbonfootprint.dto.activity.OtherActivityLogDto;
import com.carbonfootprint.entity.admin.ActivityHistoryLog;
import com.carbonfootprint.repository.admin.ActivityHistoryLogRepository;
import com.carbonfootprint.service.ActivityLogService;
import com.carbonfootprint.service.OtherActivityLogService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.List;

@Aspect
@Component
@Slf4j
public class ActivityHistoryAspect {

    private final ActivityHistoryLogRepository historyRepository;
    private final ObjectMapper objectMapper;
    private final ActivityLogService activityLogService;
    private final OtherActivityLogService otherActivityLogService;

    public ActivityHistoryAspect(ActivityHistoryLogRepository historyRepository, 
                                 ObjectMapper objectMapper, 
                                 @Lazy ActivityLogService activityLogService, 
                                 @Lazy OtherActivityLogService otherActivityLogService) {
        this.historyRepository = historyRepository;
        this.objectMapper = objectMapper;
        this.activityLogService = activityLogService;
        this.otherActivityLogService = otherActivityLogService;
    }

    // ----- CREATE -----

    @Around("execution(* com.carbonfootprint.service.ActivityLogService.createActivityLog(..)) && args(userEmail, createDto)")
    public Object aroundCreateRegular(ProceedingJoinPoint pjp, String userEmail, Object createDto) throws Throwable {
        Object result = pjp.proceed();
        if (result instanceof ActivityLogDto dto) {
            saveHistory(dto.getId(), "REGULAR", "CREATED", userEmail, null, toJson(dto));
        }
        return result;
    }

    @Around("execution(* com.carbonfootprint.service.OtherActivityLogService.createActivityLog(..)) && args(userEmail, createDto)")
    public Object aroundCreateOther(ProceedingJoinPoint pjp, String userEmail, Object createDto) throws Throwable {
        Object result = pjp.proceed();
        if (result instanceof OtherActivityLogDto dto) {
            saveHistory(dto.getId(), "OTHER", "CREATED", userEmail, null, toJson(dto));
        }
        return result;
    }

    // ----- UPDATE -----

    @Around("execution(* com.carbonfootprint.service.ActivityLogService.updateActivityLog(..)) && args(id, userEmail, updateDto)")
    public Object aroundUpdateRegular(ProceedingJoinPoint pjp, Long id, String userEmail, Object updateDto) throws Throwable {
        ActivityLogDto oldDto = null;
        try {
            oldDto = activityLogService.getActivityLogById(id, userEmail);
        } catch (Exception e) {
            log.warn("Could not fetch old state for Regular Activity {}", id);
        }

        Object result = pjp.proceed();

        if (result instanceof ActivityLogDto newDto) {
            saveHistory(newDto.getId(), "REGULAR", "UPDATED", userEmail, toJson(oldDto), toJson(newDto));
        }
        return result;
    }

    @Around("execution(* com.carbonfootprint.service.OtherActivityLogService.updateActivityLog(..)) && args(id, userEmail, updateDto)")
    public Object aroundUpdateOther(ProceedingJoinPoint pjp, Long id, String userEmail, Object updateDto) throws Throwable {
        OtherActivityLogDto oldDto = null;
        try {
            oldDto = otherActivityLogService.getOtherActivityLogById(id, userEmail);
        } catch (Exception e) {
            log.warn("Could not fetch old state for Other Activity {}", id);
        }

        Object result = pjp.proceed();

        if (result instanceof OtherActivityLogDto newDto) {
            saveHistory(newDto.getId(), "OTHER", "UPDATED", userEmail, toJson(oldDto), toJson(newDto));
        }
        return result;
    }

    // ----- DELETE -----

    @Around("execution(* com.carbonfootprint.service.ActivityLogService.deleteActivityLog(..)) && args(id, userEmail)")
    public Object aroundDeleteRegular(ProceedingJoinPoint pjp, Long id, String userEmail) throws Throwable {
        ActivityLogDto oldDto = null;
        try {
            oldDto = activityLogService.getActivityLogById(id, userEmail);
        } catch (Exception e) {
            // ignore
        }

        Object result = pjp.proceed();
        saveHistory(id, "REGULAR", "DELETED", userEmail, toJson(oldDto), null);
        return result;
    }

    @Around("execution(* com.carbonfootprint.service.OtherActivityLogService.deleteActivityLog(..)) && args(id, userEmail)")
    public Object aroundDeleteOther(ProceedingJoinPoint pjp, Long id, String userEmail) throws Throwable {
        OtherActivityLogDto oldDto = null;
        try {
            oldDto = otherActivityLogService.getOtherActivityLogById(id, userEmail);
        } catch (Exception e) {
            // ignore
        }

        Object result = pjp.proceed();
        saveHistory(id, "OTHER", "DELETED", userEmail, toJson(oldDto), null);
        return result;
    }

    // ----- HELPER -----

    private void saveHistory(Long activityId, String logType, String action, String changedBy, String oldData, String newData) {
        try {
            ActivityHistoryLog log = ActivityHistoryLog.builder()
                    .activityId(activityId)
                    .logType(logType)
                    .action(action)
                    .changedBy(changedBy)
                    .oldData(oldData)
                    .newData(newData)
                    .build();
            historyRepository.save(log);
        } catch (Exception e) {
            log.error("Failed to save activity history log", e);
        }
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
