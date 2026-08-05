package com.carbonfootprint.service;

import com.carbonfootprint.dto.activity.QuickLogDto;
import com.carbonfootprint.dto.activity.QuickLogPinRequest;
import com.carbonfootprint.entity.ActivityType;
import com.carbonfootprint.entity.PinnedActivity;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.ActivityTypeRepository;
import com.carbonfootprint.repository.PinnedActivityRepository;
import com.carbonfootprint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuickLogService {

    private final PinnedActivityRepository pinnedActivityRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ActivityTypeRepository activityTypeRepository;
    private final UserRepository userRepository;

    public List<QuickLogDto> getQuickLogs(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<QuickLogDto> quickLogs = new ArrayList<>();
        Set<String> uniqueKeys = new HashSet<>(); // activityTypeId_dynamicInputs

        // 1. Fetch Pinned Activities (Highest Priority)
        List<PinnedActivity> pinnedActivities = pinnedActivityRepository.findByUserId(user.getId());
        for (PinnedActivity pinned : pinnedActivities) {
            ActivityType type = pinned.getActivityType();
            String key = type.getId() + "_" + (pinned.getDynamicInputs() != null ? pinned.getDynamicInputs() : "");
            
            QuickLogDto dto = QuickLogDto.builder()
                    .id(pinned.getId())
                    .activityTypeId(type.getId())
                    .categoryCode(type.getSubCategory().getCategory().getCode())
                    .activityTypeCode(type.getCode())
                    .dynamicInputs(pinned.getDynamicInputs())
                    .icon(type.getCode()) // Using code as icon hint
                    .name(type.getName())
                    .category(type.getSubCategory().getCategory().getName())
                    .preferredUnit(null) // Not available in ActivityType
                    .isPinned(true)
                    .score(1000.0) // Very high score
                    .build();
            quickLogs.add(dto);
            uniqueKeys.add(key);
        }

        // 2. Fetch Frequently Used Activities
        List<Object[]> frequent = activityLogRepository.getFrequentlyUsedActivities(user.getId(), PageRequest.of(0, 10));
        for (Object[] row : frequent) {
            String key = row[0] + "_" + (row[1] != null ? row[1].toString() : "");
            if (!uniqueKeys.contains(key)) {
                QuickLogDto dto = mapObjectRowToDto(row);
                
                // Smart suggestion scoring
                double score = calculateSmartScore(dto);
                dto.setScore(score);
                
                quickLogs.add(dto);
                uniqueKeys.add(key);
            }
        }

        // 3. Fetch Recently Used Activities
        List<Object[]> recent = activityLogRepository.getRecentlyUsedActivities(user.getId(), PageRequest.of(0, 10));
        for (Object[] row : recent) {
            String key = row[0] + "_" + (row[1] != null ? row[1].toString() : "");
            if (!uniqueKeys.contains(key)) {
                QuickLogDto dto = mapObjectRowToDto(row);
                
                // Recent gets a slight bump
                double score = calculateSmartScore(dto) + 50.0;
                dto.setScore(score);
                
                quickLogs.add(dto);
                uniqueKeys.add(key);
            }
        }

        // Sort by Score DESC (Pinned will always be at top because score=1000)
        quickLogs.sort(Comparator.comparing(QuickLogDto::getScore).reversed());

        return quickLogs;
    }

    private QuickLogDto mapObjectRowToDto(Object[] row) {
        Long activityTypeId = (Long) row[0];
        String dynamicInputs = row[1] != null ? row[1].toString() : null;
        String name = (String) row[2];
        String category = (String) row[3];
        String categoryCode = (String) row[4];
        String activityTypeCode = (String) row[5];
        
        LocalDate lastUsedDate = null;
        if (row[6] instanceof java.sql.Date) {
            lastUsedDate = ((java.sql.Date) row[6]).toLocalDate();
        } else if (row[6] instanceof LocalDate) {
            lastUsedDate = (LocalDate) row[6];
        }
        
        Long usageCount = ((Number) row[7]).longValue();
        String preferredUnit = (String) row[8];
        
        BigDecimal suggestedQuantity = null;
        if (row[9] != null) {
            suggestedQuantity = BigDecimal.valueOf(((Number) row[9]).doubleValue());
        }

        return QuickLogDto.builder()
                .activityTypeId(activityTypeId)
                .dynamicInputs(dynamicInputs)
                .icon(activityTypeCode) // Using code as icon hint
                .name(name)
                .category(category)
                .categoryCode(categoryCode)
                .activityTypeCode(activityTypeCode)
                .lastUsedDate(lastUsedDate)
                .usageCount(usageCount)
                .preferredUnit(preferredUnit)
                .isPinned(false)
                .suggestedQuantity(suggestedQuantity)
                .build();
    }

    private double calculateSmartScore(QuickLogDto dto) {
        double score = dto.getUsageCount() != null ? dto.getUsageCount() * 2.0 : 0.0;
        
        LocalTime now = LocalTime.now();
        int hour = now.getHour();
        
        // Example Smart Suggestions based on time of day
        if (dto.getCategoryCode() != null) {
            if (dto.getCategoryCode().equals("TRANSPORT")) {
                if (hour >= 6 && hour <= 10) score += 30.0; // Morning commute
                if (hour >= 16 && hour <= 20) score += 30.0; // Evening commute
            } else if (dto.getCategoryCode().equals("FOOD")) {
                if (hour >= 11 && hour <= 14) score += 40.0; // Lunch
                if (hour >= 18 && hour <= 21) score += 40.0; // Dinner
            } else if (dto.getCategoryCode().equals("ENERGY")) {
                if (hour >= 18 || hour <= 2) score += 25.0; // Evening/Night electricity
            }
        }
        
        return score;
    }

    @Transactional
    public QuickLogDto pinActivity(String username, QuickLogPinRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ActivityType type = activityTypeRepository.findById(request.getActivityTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Activity Type not found"));

        Optional<PinnedActivity> existing = pinnedActivityRepository.findByUserIdAndActivityTypeIdAndDynamicInputs(
                user.getId(), type.getId(), request.getDynamicInputs());

        if (existing.isPresent()) {
            throw new IllegalArgumentException("Activity is already pinned");
        }

        PinnedActivity pinned = PinnedActivity.builder()
                .user(user)
                .activityType(type)
                .dynamicInputs(request.getDynamicInputs())
                .build();

        pinnedActivityRepository.save(pinned);
        
        return QuickLogDto.builder()
                .id(pinned.getId())
                .activityTypeId(type.getId())
                .dynamicInputs(pinned.getDynamicInputs())
                .icon(type.getCode())
                .name(type.getName())
                .category(type.getSubCategory().getCategory().getName())
                .isPinned(true)
                .build();
    }

    @Transactional
    public void unpinActivity(String username, Long pinnedActivityId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PinnedActivity pinned = pinnedActivityRepository.findByUserIdAndId(user.getId(), pinnedActivityId)
                .orElseThrow(() -> new ResourceNotFoundException("Pinned activity not found"));

        pinnedActivityRepository.delete(pinned);
    }
}
