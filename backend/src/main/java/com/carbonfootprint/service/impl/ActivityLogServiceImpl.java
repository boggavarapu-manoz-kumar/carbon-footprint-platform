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
import com.carbonfootprint.repository.ActivityLogSpecification;
import com.carbonfootprint.repository.ActivityTypeRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final ActivityTypeRepository activityTypeRepository;
    private final UserRepository userRepository;
    private final ActivityLogMapper mapper;
    private final com.carbonfootprint.service.EmissionCalculationService calculationService;

    @Override
    @Transactional
    public ActivityLogDto createActivityLog(final String userEmail, final ActivityLogCreateDto createDto) {
        log.info("Creating activity log for user: {}", userEmail);
        User user = getUserByEmail(userEmail);
        
        ActivityType type = activityTypeRepository.findByCode(createDto.getActivityType())
                .orElseThrow(() -> new ResourceNotFoundException("ActivityType", "code", createDto.getActivityType()));
        
        ActivityLog activityLog = mapper.toEntity(createDto);
        activityLog.setUser(user);
        activityLog.setActivityType(type);
        
        activityLog.setEmissionValue(calculationService.calculateEmission(createDto.getActivityType(), createDto.getQuantity(), createDto.getUnit()).getEmission());
        
        return mapper.toDto(activityLogRepository.save(activityLog));
    }

    @Override
    @Transactional
    public List<ActivityLogDto> createActivityLogsBulk(final String userEmail, final List<ActivityLogCreateDto> createDtos) {
        log.info("Bulk creating {} activity logs for user: {}", createDtos.size(), userEmail);
        User user = getUserByEmail(userEmail);
        
        // Optimize: Prevent N+1 queries by pre-fetching all required ActivityTypes
        java.util.Set<String> typeCodes = createDtos.stream().map(ActivityLogCreateDto::getActivityType).collect(Collectors.toSet());
        java.util.Map<String, ActivityType> typeMap = activityTypeRepository.findByCodeIn(typeCodes).stream()
                .collect(Collectors.toMap(ActivityType::getCode, type -> type));
        
        List<ActivityLog> logsToSave = createDtos.stream().map(dto -> {
            ActivityType type = typeMap.get(dto.getActivityType());
            if (type == null) {
                throw new ResourceNotFoundException("ActivityType", "code", dto.getActivityType());
            }
            ActivityLog logItem = mapper.toEntity(dto);
            logItem.setUser(user);
            logItem.setActivityType(type);
            logItem.setEmissionValue(calculationService.calculateEmission(dto.getActivityType(), dto.getQuantity(), dto.getUnit()).getEmission());
            return logItem;
        }).collect(Collectors.toList());
        
        List<ActivityLog> savedLogs = activityLogRepository.saveAll(logsToSave);
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
            activityLog = activityLogRepository.save(activityLog);
        }
        return mapper.toDto(activityLog);
    }

    @Override
    @Transactional
    public void deleteActivityLog(final Long id, final String userEmail) {
        User user = getUserByEmail(userEmail);
        ActivityLog activityLog = findActivityLogOwnedByUser(id, user.getId());
        activityLogRepository.delete(activityLog);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private ActivityLog findActivityLogOwnedByUser(Long logId, Long userId) {
        return activityLogRepository.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("ActivityLog not found or access denied"));
    }
}
