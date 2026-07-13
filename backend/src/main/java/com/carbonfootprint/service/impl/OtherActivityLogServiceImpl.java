package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.activity.OtherActivityLogCreateDto;
import com.carbonfootprint.dto.activity.OtherActivityLogDto;
import com.carbonfootprint.entity.OtherActivityLog;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.OtherActivityLogRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.OtherActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtherActivityLogServiceImpl implements OtherActivityLogService {

    private final OtherActivityLogRepository repository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OtherActivityLogDto createOtherActivityLog(String userEmail, OtherActivityLogCreateDto createDto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        OtherActivityLog logEntity = OtherActivityLog.builder()
                .user(user)
                .activityName(createDto.getActivityName())
                .activityDescription(createDto.getActivityDescription())
                .quantity(createDto.getQuantity())
                .unit(createDto.getUnit())
                .logDate(createDto.getLogDate())
                .logTime(createDto.getLogTime())
                .carbonValue(createDto.getCarbonValue() != null ? createDto.getCarbonValue() : BigDecimal.ZERO)
                .notes(createDto.getNotes())
                .build();

        OtherActivityLog saved = repository.save(logEntity);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OtherActivityLogDto getOtherActivityLogById(Long id, String userEmail) {
        OtherActivityLog logEntity = repository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("OtherActivityLog not found or access denied"));
        return mapToDto(logEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OtherActivityLogDto> searchOtherActivityLogs(String userEmail, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return repository.findByUserEmailAndDateRange(userEmail, startDate, endDate, pageable)
                .map(this::mapToDto);
    }

    @Override
    @Transactional
    public void deleteOtherActivityLog(Long id, String userEmail) {
        OtherActivityLog logEntity = repository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("OtherActivityLog not found or access denied"));
        repository.delete(logEntity);
    }

    private OtherActivityLogDto mapToDto(OtherActivityLog entity) {
        return OtherActivityLogDto.builder()
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
}
