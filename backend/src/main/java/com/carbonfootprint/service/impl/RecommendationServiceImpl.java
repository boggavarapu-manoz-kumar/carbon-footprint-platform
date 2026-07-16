package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.recommendation.RecommendationEffectivenessDto;
import com.carbonfootprint.dto.recommendation.RecommendationResponseDto;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationServiceImpl implements RecommendationService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final RecommendationLibrary recommendationLibrary;

    @Override
    public List<RecommendationResponseDto> getPersonalizedRecommendations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();

        // Get emissions sum by category for the last 30 days
        List<Object[]> topActivities = activityLogRepository.sumEmissionsByCategoryAndDateRange(user.getId(), thirtyDaysAgo, today);

        // Sort by emission descending and limit to top 3
        List<Object[]> top3 = topActivities.stream()
                .sorted((o1, o2) -> ((BigDecimal) o2[1]).compareTo((BigDecimal) o1[1]))
                .limit(3)
                .collect(Collectors.toList());

        List<RecommendationResponseDto> recommendations = new ArrayList<>();
        
        for (Object[] obj : top3) {
            String category = (String) obj[0];
            BigDecimal emission = (BigDecimal) obj[1];
            
            recommendations.add(generateRecommendation(category, emission));
        }

        return recommendations;
    }

    @Override
    public List<RecommendationEffectivenessDto> trackRecommendationEffectiveness(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);
        LocalDate sixtyDaysAgo = today.minusDays(60);

        // Previous 30 Days (Days -60 to -30)
        List<Object[]> previousActivities = activityLogRepository.sumEmissionsByCategoryAndDateRange(user.getId(), sixtyDaysAgo, thirtyDaysAgo);
        
        // Current 30 Days (Days -30 to Today)
        List<Object[]> currentActivities = activityLogRepository.sumEmissionsByCategoryAndDateRange(user.getId(), thirtyDaysAgo, today);

        // Convert lists to maps for easy lookup
        java.util.Map<String, BigDecimal> previousMap = previousActivities.stream()
                .collect(Collectors.toMap(
                        obj -> (String) obj[0],
                        obj -> (BigDecimal) obj[1]
                ));

        java.util.Map<String, BigDecimal> currentMap = currentActivities.stream()
                .collect(Collectors.toMap(
                        obj -> (String) obj[0],
                        obj -> (BigDecimal) obj[1]
                ));

        // Get all unique categories across both periods
        java.util.Set<String> allCategories = new java.util.HashSet<>();
        allCategories.addAll(previousMap.keySet());
        allCategories.addAll(currentMap.keySet());

        List<RecommendationEffectivenessDto> effectivenessList = new ArrayList<>();

        for (String category : allCategories) {
            BigDecimal beforeEmission = previousMap.getOrDefault(category, BigDecimal.ZERO);
            BigDecimal afterEmission = currentMap.getOrDefault(category, BigDecimal.ZERO);
            
            BigDecimal emissionReduction = beforeEmission.subtract(afterEmission);
            
            BigDecimal progressPercentage = BigDecimal.ZERO;
            if (beforeEmission.compareTo(BigDecimal.ZERO) > 0) {
                progressPercentage = emissionReduction.multiply(new BigDecimal("100"))
                        .divide(beforeEmission, 2, java.math.RoundingMode.HALF_UP);
            } else if (afterEmission.compareTo(BigDecimal.ZERO) > 0) {
                // If there were no emissions before but there are now, it's a 100% increase (negative progress)
                progressPercentage = new BigDecimal("-100.00");
            }
            
            String status = emissionReduction.compareTo(BigDecimal.ZERO) > 0 ? "SUCCESS" : "FAILURE";
            
            // Calculate improvement score (1-100 based on progress percentage)
            int improvementScore = 0;
            if (progressPercentage.compareTo(BigDecimal.ZERO) > 0) {
                improvementScore = Math.min(100, progressPercentage.intValue());
            }

            effectivenessList.add(RecommendationEffectivenessDto.builder()
                    .category(category)
                    .beforeEmission(beforeEmission)
                    .afterEmission(afterEmission)
                    .emissionReduction(emissionReduction)
                    .progressPercentage(progressPercentage)
                    .improvementScore(improvementScore)
                    .status(status)
                    .build());
        }

        // Sort by biggest reduction first
        effectivenessList.sort((e1, e2) -> e2.getEmissionReduction().compareTo(e1.getEmissionReduction()));

        return effectivenessList;
    }

    private RecommendationResponseDto generateRecommendation(String category, BigDecimal emission) {
        String difficulty;
        String impact;
        int priority;

        if (category == null) {
            category = "General Activity";
        }

        String catLower = category.toLowerCase();
        
        if (catLower.contains("flight") || catLower.contains("air")) {
            difficulty = "Medium";
            impact = "High";
            priority = 90;
        } else if (catLower.contains("transport") || catLower.contains("car") || catLower.contains("vehicle") || catLower.contains("travel")) {
            difficulty = "Medium";
            impact = "High";
            priority = 85;
        } else if (catLower.contains("electricity") || catLower.contains("power") || catLower.contains("energy") || catLower.contains("ac usage")) {
            difficulty = "Easy";
            impact = "Medium";
            priority = 75;
        } else if (catLower.contains("food") || catLower.contains("diet") || catLower.contains("meal") || catLower.contains("red meat")) {
            difficulty = "Easy";
            impact = "Medium";
            priority = 70;
        } else if (catLower.contains("shopping") || catLower.contains("purchases")) {
            difficulty = "Easy";
            impact = "Low";
            priority = 60;
        } else {
            difficulty = "Medium";
            impact = "Low";
            priority = 50;
        }

        String recText = recommendationLibrary.generateRecommendationText(category, emission);
        BigDecimal reductionTarget = recommendationLibrary.getReductionPercentageTarget(category);
        
        BigDecimal monthly = emission.multiply(reductionTarget).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal weekly = monthly.multiply(new BigDecimal("7")).divide(new BigDecimal("30"), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal yearly = monthly.multiply(new BigDecimal("365")).divide(new BigDecimal("30"), 2, java.math.RoundingMode.HALF_UP);

        return RecommendationResponseDto.builder()
                .activity(category)
                .emission(emission)
                .impactLevel(impact)
                .recommendation(recText)
                .potentialWeeklyReduction(weekly)
                .potentialMonthlyReduction(monthly)
                .potentialYearlyReduction(yearly)
                .reductionPercentageTarget(reductionTarget)
                .difficultyLevel(difficulty)
                .priorityScore(priority)
                .build();
    }
}
