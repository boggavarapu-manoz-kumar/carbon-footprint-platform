package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.activity.ActivityLogCreateDto;
import com.carbonfootprint.dto.activity.ActivityLogDto;
import com.carbonfootprint.dto.activity.ActivityLogUpdateDto;
import com.carbonfootprint.entity.ActivityLog;
import com.carbonfootprint.entity.ActivityType;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.mapper.ActivityLogMapper;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.event.GamificationEvent;
import com.carbonfootprint.event.UserMetricsUpdatedEvent;
import org.springframework.context.ApplicationEventPublisher;
import com.carbonfootprint.repository.ActivityLogSpecification;
import com.carbonfootprint.repository.ActivityTypeRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.repository.UserActivityMonitorRepositoryCustom;
import com.carbonfootprint.dto.activity.UserActivityHistoryDTO;
import com.carbonfootprint.dto.activity.UserActivityHistoryFilterDTO;
import com.carbonfootprint.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ActivityTypeRepository activityTypeRepository;
    private final UserRepository userRepository;
    private final UserActivityMonitorRepositoryCustom userActivityMonitorRepository;
    private final ActivityLogMapper mapper;
    private final com.carbonfootprint.service.EmissionCalculationService calculationService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final com.carbonfootprint.service.GoalService goalService;

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = { "dashboardMetrics", "analyticsCache", "emissionTrends" }, allEntries = true)
    public ActivityLogDto createActivityLog(final String userEmail, final ActivityLogCreateDto createDto) {
        log.info("Creating activity log for user: {}", userEmail);
        User user = getUserByEmail(userEmail);
        
        String activityTypeCode = createDto.getActivityType() != null ? createDto.getActivityType().trim() : "";
        ActivityType type = activityTypeRepository.findByCode(activityTypeCode)
                .or(() -> activityTypeRepository.findByCode(activityTypeCode.toUpperCase()))
                .or(() -> activityTypeRepository.findByCode(activityTypeCode.toLowerCase()))
                .orElseThrow(() -> new ResourceNotFoundException("ActivityType", "code", createDto.getActivityType()));
        
        ActivityLog activityLog = mapper.toEntity(createDto);
        activityLog.setUser(user);
        activityLog.setActivityType(type);

        if (activityLog.getUnit() == null || activityLog.getUnit().trim().isEmpty()) {
            activityLog.setUnit(createDto.getUnit() != null ? createDto.getUnit() : "units");
        }

        var calcResponse = calculationService.calculateEmission(createDto.getActivityType(), createDto.getQuantity(), createDto.getUnit());
        activityLog.setEmissionValue(calcResponse != null && calcResponse.getEmission() != null ? calcResponse.getEmission() : BigDecimal.ZERO);
        
        ActivityLog savedActivity = activityLogRepository.save(activityLog);
        ActivityLogDto savedDto = mapper.toDto(savedActivity);

        executeAfterCommit(() -> triggerPostActivityEvents(user, savedActivity));

        return savedDto;
    }

    @Override
    @Transactional
    public List<ActivityLogDto> createActivityLogsBulk(final String userEmail, final List<ActivityLogCreateDto> createDtos) {
        log.info("Bulk creating {} activity logs for user: {}", createDtos.size(), userEmail);
        User user = getUserByEmail(userEmail);
        
        java.util.Set<String> typeCodes = createDtos.stream().map(ActivityLogCreateDto::getActivityType).collect(Collectors.toSet());
        java.util.Map<String, ActivityType> typeMap = activityTypeRepository.findByCodeIn(typeCodes).stream()
                .collect(Collectors.toMap(ActivityType::getCode, type -> type));
        
        List<ActivityLog> logsToSave = createDtos.stream().map(dto -> {
            ActivityType type = typeMap.get(dto.getActivityType());
            if (type == null) {
                type = activityTypeRepository.findByCode(dto.getActivityType())
                        .or(() -> activityTypeRepository.findByCode(dto.getActivityType().toUpperCase()))
                        .orElseThrow(() -> new ResourceNotFoundException("ActivityType", "code", dto.getActivityType()));
            }
            ActivityLog logItem = mapper.toEntity(dto);
            logItem.setUser(user);
            logItem.setActivityType(type);
            if (logItem.getUnit() == null || logItem.getUnit().trim().isEmpty()) {
                logItem.setUnit(dto.getUnit() != null ? dto.getUnit() : "units");
            }
            var calc = calculationService.calculateEmission(dto.getActivityType(), dto.getQuantity(), dto.getUnit());
            logItem.setEmissionValue(calc != null && calc.getEmission() != null ? calc.getEmission() : BigDecimal.ZERO);
            return logItem;
        }).collect(Collectors.toList());
        
        List<ActivityLog> savedLogs = activityLogRepository.saveAll(logsToSave);
        
        executeAfterCommit(() -> {
            for (ActivityLog savedActivity : savedLogs) {
                triggerPostActivityEvents(user, savedActivity);
            }
        });

        return savedLogs.stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Override
    public com.carbonfootprint.dto.activity.CalculationResponseDto calculateEmission(com.carbonfootprint.dto.activity.CalculationRequestDto requestDto) {
        return calculationService.calculateEmission(requestDto.getActivityType(), requestDto.getQuantity(), requestDto.getUnit());
    }

    @Override
    @Transactional(readOnly = true)
    public ActivityLogDto getActivityLogById(final Long id, final String userEmail) {
        User user = getUserByEmail(userEmail);
        return mapper.toDto(findActivityLogOwnedByUser(id, user.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityLogDto> searchActivityLogs(
            final String userEmail, 
            final String categoryCode, 
            final LocalDate startDate, 
            final LocalDate endDate, 
            final Pageable pageable) {
            
        log.debug("Advanced search for user {} with filters", userEmail);
        User user = getUserByEmail(userEmail);
        
        Specification<ActivityLog> spec = Specification
                .where(ActivityLogSpecification.belongsToUser(user.getId()))
                .and(ActivityLogSpecification.hasCategoryCode(categoryCode))
                .and(ActivityLogSpecification.isBetweenDates(startDate, endDate));

        return activityLogRepository.findAll(spec, pageable).map(mapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserActivityHistoryDTO> getUnifiedActivityHistory(String userEmail, UserActivityHistoryFilterDTO filter, Pageable pageable) {
        log.debug("Fetching unified activity history for user {} with filters", userEmail);
        return userActivityMonitorRepository.findFilteredUserActivities(userEmail, filter, pageable);
    }

    @Override
    @Transactional
    public ActivityLogDto updateActivityLog(final Long id, final String userEmail, final ActivityLogUpdateDto updateDto) {
        User user = getUserByEmail(userEmail);
        ActivityLog activityLog = findActivityLogOwnedByUser(id, user.getId());

        boolean updated = false;
        boolean needsRecalculation = false;
        
        if (updateDto.getActivityType() != null && !updateDto.getActivityType().trim().isEmpty()) { 
            ActivityType type = activityTypeRepository.findByCode(updateDto.getActivityType().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("ActivityType", "code", updateDto.getActivityType().trim()));
            activityLog.setActivityType(type); 
            updated = true; 
            needsRecalculation = true;
        }
        if (updateDto.getQuantity() != null) { 
            activityLog.setQuantity(updateDto.getQuantity()); 
            updated = true; 
            needsRecalculation = true;
        }
        if (updateDto.getUnit() != null && !updateDto.getUnit().trim().isEmpty()) { 
            activityLog.setUnit(updateDto.getUnit().trim()); 
            updated = true; 
            needsRecalculation = true;
        }
        if (updateDto.getLogDate() != null) { activityLog.setLogDate(updateDto.getLogDate()); updated = true; }

        if (needsRecalculation) {
            activityLog.setEmissionValue(calculationService.calculateEmission(
                activityLog.getActivityType().getCode(), 
                activityLog.getQuantity(), 
                activityLog.getUnit()
            ).getEmission());
        }

        if (updated) {
            ActivityLog saved = activityLogRepository.save(activityLog);
            executeAfterCommit(() -> {
                invalidateAnalyticsCache(user.getId());
                try { goalService.evaluateUserGoals(user.getId()); } catch (Exception ignored) {}
            });
            return mapper.toDto(saved);
        }
        return mapper.toDto(activityLog);
    }

    @Override
    @Transactional
    public void deleteActivityLog(final Long id, final String userEmail) {
        User user = getUserByEmail(userEmail);
        ActivityLog activityLog = findActivityLogOwnedByUser(id, user.getId());
        activityLogRepository.delete(activityLog);
        
        executeAfterCommit(() -> {
            try {
                eventPublisher.publishEvent(new GamificationEvent(
                    this, 
                    user.getId(), 
                    GamificationEvent.EventType.ACTIVITY_DELETED, 
                    "ACTIVITY_DELETED", 
                    "ACTIVITY_LOG",
                    "activity_" + id, 
                    null
                ));
            } catch (Exception ignored) {}

            invalidateAnalyticsCache(user.getId());
            try { goalService.evaluateUserGoals(user.getId()); } catch (Exception ignored) {}
        });
    }

    private void executeAfterCommit(Runnable task) {
        if (org.springframework.transaction.support.TransactionSynchronizationManager.isSynchronizationActive()) {
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            task.run();
                        } catch (Exception e) {
                            log.warn("Non-fatal error in post-commit task: {}", e.getMessage());
                        }
                    }
                }
            );
        } else {
            try {
                task.run();
            } catch (Exception e) {
                log.warn("Non-fatal error in task: {}", e.getMessage());
            }
        }
    }

    private void triggerPostActivityEvents(User user, ActivityLog savedActivity) {
        try {
            eventPublisher.publishEvent(new GamificationEvent(
                this, 
                user.getId(), 
                GamificationEvent.EventType.ACTIVITY_LOGGED, 
                "FIRST_ACTIVITY_LOGGED",
                "ACTIVITY_LOG",
                "activity_" + savedActivity.getId(), 
                null
            ));
        } catch (Exception e) {
            log.warn("Non-fatal: gamification event failed: {}", e.getMessage());
        }

        try {
            invalidateAnalyticsCache(user.getId());
        } catch (Exception ignored) {
        }
        
        try {
            goalService.evaluateUserGoals(user.getId());
        } catch (Exception e) {
            log.warn("Non-fatal: goal evaluation failed: {}", e.getMessage());
        }

        try {
            eventPublisher.publishEvent(new UserMetricsUpdatedEvent(this, user.getId()));
        } catch (Exception e) {
            log.warn("Non-fatal: user metrics event failed: {}", e.getMessage());
        }
    }

    private User getUserByEmail(String identifier) {
        return userRepository.findByUsernameOrEmail(identifier, identifier)
                .orElseGet(() -> userRepository.findByEmail(identifier)
                .orElseGet(() -> userRepository.findByUsername(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for identifier: " + identifier))));
    }

    private ActivityLog findActivityLogOwnedByUser(Long logId, Long userId) {
        return activityLogRepository.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("ActivityLog not found or access denied"));
    }

    private void invalidateAnalyticsCache(Long userId) {
        try {
            redisTemplate.delete("analytics:daily:" + userId);
            redisTemplate.delete("analytics:weekly:" + userId);
            redisTemplate.delete("analytics:monthly:" + userId);
            redisTemplate.delete("weeklyGoalProgress::" + userId);
        } catch (Exception e) {
            log.warn("Redis is unavailable, skipping cache invalidation for user {}", userId);
        }
        log.info("Invalidated Redis analytics cache for user {}", userId);
    }
}
