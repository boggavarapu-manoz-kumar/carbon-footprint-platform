package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.analytics.TopActivityDto;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.TopActivityDetectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TopActivityDetectionServiceImpl implements TopActivityDetectionService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    @Override
    public List<TopActivityDto> getTopEmissionActivities(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        BigDecimal totalEmissions = activityLogRepository.sumEmissionsByUserId(user.getId());
        if (totalEmissions == null || totalEmissions.compareTo(BigDecimal.ZERO) == 0) {
            return new ArrayList<>();
        }

        List<Object[]> topActivities = activityLogRepository.getTopEmissionActivitiesByUser(user.getId());
        
        List<Object[]> top3 = topActivities.stream()
                .limit(3)
                .collect(Collectors.toList());

        List<TopActivityDto> result = new ArrayList<>();
        int rank = 1;
        
        for (Object[] obj : top3) {
            String activityName = (String) obj[0];
            String categoryName = (String) obj[1];
            BigDecimal emission = (BigDecimal) obj[2];
            Long frequency = (Long) obj[3];
            
            BigDecimal percentage = emission.multiply(new BigDecimal(100))
                    .divide(totalEmissions, 2, RoundingMode.HALF_UP);
                    
            result.add(TopActivityDto.builder()
                    .rank(rank++)
                    .activityName(activityName)
                    .categoryName(categoryName)
                    .totalEmissions(emission)
                    .emissionPercentage(percentage)
                    .frequency(frequency)
                    .build());
        }

        return result;
    }
}
