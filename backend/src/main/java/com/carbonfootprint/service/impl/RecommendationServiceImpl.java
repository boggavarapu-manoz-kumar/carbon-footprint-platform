package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.recommendation.RecommendationEffectivenessDto;
import com.carbonfootprint.dto.recommendation.RecommendationResponseDto;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.entity.Goal;
import com.carbonfootprint.entity.GoalStatus;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.GoalRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.repository.RecommendationCacheRepository;
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
    private final GoalRepository goalRepository;
    private final RecommendationLibrary recommendationLibrary;
    private final GeminiService geminiService;
    private final RecommendationCacheRepository recommendationCacheRepository;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Override
    public List<RecommendationResponseDto> getPersonalizedRecommendations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);
        LocalDate sixtyDaysAgo = today.minusDays(60);

        LocalDate startOfWeek = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate startOfYear = today.withDayOfYear(1);

        // Get max last activity date for each timeframe
        java.time.LocalDateTime lastDailyActivity = activityLogRepository.getMaxCreatedAtByUserIdAndDateRange(user.getId(), today, today);
        java.time.LocalDateTime lastWeeklyActivity = activityLogRepository.getMaxCreatedAtByUserIdAndDateRange(user.getId(), startOfWeek, today);
        java.time.LocalDateTime lastMonthlyActivity = activityLogRepository.getMaxCreatedAtByUserIdAndDateRange(user.getId(), startOfMonth, today);
        java.time.LocalDateTime lastYearlyActivity = activityLogRepository.getMaxCreatedAtByUserIdAndDateRange(user.getId(), startOfYear, today);

        // Get emissions sum by category for the last 30 days
        List<Object[]> topActivities = activityLogRepository.sumEmissionsByCategoryAndDateRange(user.getId(), thirtyDaysAgo, today);
        List<Object[]> previousActivities = activityLogRepository.sumEmissionsByCategoryAndDateRange(user.getId(), sixtyDaysAgo, thirtyDaysAgo);

        BigDecimal totalEmissions = BigDecimal.ZERO;
        for (Object[] obj : topActivities) {
            totalEmissions = totalEmissions.add((BigDecimal) obj[1]);
        }
        BigDecimal previousTotalEmissions = BigDecimal.ZERO;
        for (Object[] obj : previousActivities) {
            previousTotalEmissions = previousTotalEmissions.add((BigDecimal) obj[1]);
        }

        // Sort by emission descending and limit to top 3
        List<Object[]> top3 = topActivities.stream()
                .sorted((o1, o2) -> ((BigDecimal) o2[1]).compareTo((BigDecimal) o1[1]))
                .limit(3)
                .collect(Collectors.toList());

        List<RecommendationResponseDto> recommendations = new ArrayList<>();
        if (top3.isEmpty()) {
            return recommendations;
        }

        List<Goal> activeGoals = goalRepository.findByUserIdAndStatus(user.getId(), GoalStatus.IN_PROGRESS);

        // Determine which tips need to be generated for which categories
        java.util.Map<String, List<String>> neededTips = new java.util.HashMap<>();
        java.util.Map<String, java.util.Map<String, String>> cachedTips = new java.util.HashMap<>();

        for (Object[] obj : top3) {
            String category = (String) obj[0];
            cachedTips.put(category, new java.util.HashMap<>());
            List<String> needed = new ArrayList<>();

            checkCacheOrNeed(user.getId(), category, "DAILY", lastDailyActivity, needed, cachedTips.get(category));
            checkCacheOrNeed(user.getId(), category, "WEEKLY", lastWeeklyActivity, needed, cachedTips.get(category));
            checkCacheOrNeed(user.getId(), category, "MONTHLY", lastMonthlyActivity, needed, cachedTips.get(category));
            checkCacheOrNeed(user.getId(), category, "YEARLY", lastYearlyActivity, needed, cachedTips.get(category));

            if (!needed.isEmpty()) {
                neededTips.put(category, needed);
            }
        }

        // If any tips are needed, call Gemini
        if (!neededTips.isEmpty()) {
            try {
                StringBuilder prompt = new StringBuilder();
                prompt.append("ROLE: Act as a Google AI Product Engineer. MISSION: Generate dynamic AI recommendations.\n\n");
                prompt.append("Analyze the following user context:\n");
                prompt.append("Top 3 Highest Emission Activities (Last 30 Days):\n");
                for (Object[] obj : top3) {
                    prompt.append("- ").append(obj[0]).append(": ").append(obj[1]).append(" kg CO2e\n");
                }
                prompt.append("\nHistorical Behaviour (Previous 30 Days):\n");
                prompt.append("Total Emissions: ").append(previousTotalEmissions).append(" kg CO2e\n");
                prompt.append("Current Total Emissions: ").append(totalEmissions).append(" kg CO2e\n");
                
                prompt.append("\nActive Goals & Trajectory Status:\n");
                for (Goal g : activeGoals) {
                    String categoryMatch = mapGoalTypeToCategory(g.getGoalType());
                    
                    // Calculate Trajectory
                    String trajectoryStatus = "ON TRACK";
                    if (g.getStatus() == GoalStatus.FAILED) {
                        trajectoryStatus = "FAILED";
                    } else if (g.getStatus() == GoalStatus.IN_PROGRESS && g.getStartDate() != null && g.getTargetDate() != null) {
                        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(g.getStartDate(), g.getTargetDate());
                        long elapsedDays = java.time.temporal.ChronoUnit.DAYS.between(g.getStartDate(), today);
                        if (totalDays > 0) {
                            double timeElapsedPct = ((double) elapsedDays / totalDays) * 100.0;
                            double carbonConsumedPct = g.getProgressPercent() != null ? g.getProgressPercent().doubleValue() : 0.0;
                            
                            if (carbonConsumedPct > timeElapsedPct + 5) {
                                trajectoryStatus = "BEHIND";
                            } else if (carbonConsumedPct < timeElapsedPct - 5) {
                                trajectoryStatus = "AHEAD";
                            }
                        }
                    }

                    long daysLeft = g.getTargetDate() != null ? java.time.temporal.ChronoUnit.DAYS.between(today, g.getTargetDate()) : 0;
                    BigDecimal target = g.getTargetEmission() != null ? g.getTargetEmission() : BigDecimal.ZERO;
                    BigDecimal current = (g.getProgressPercent() != null && target.compareTo(BigDecimal.ZERO) > 0) ? 
                            target.multiply(g.getProgressPercent()).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO;
                    BigDecimal remaining = target.subtract(current).max(BigDecimal.ZERO);

                    prompt.append("- Category: ").append(categoryMatch)
                          .append(" | Goal: ").append(g.getName())
                          .append(" | Status: ").append(trajectoryStatus)
                          .append(" | Target: ").append(target).append(" kg")
                          .append(" | Remaining: ").append(remaining).append(" kg")
                          .append(" | Days Left: ").append(daysLeft).append("\n");
                }

                prompt.append("\nTONE INSTRUCTIONS BASED ON GOAL STATUS:\n");
                prompt.append("- If Status is 'AHEAD', generate purely motivational recommendations to keep up the good work.\n");
                prompt.append("- If Status is 'ON TRACK', generate optimization recommendations to fine-tune their routine.\n");
                prompt.append("- If Status is 'BEHIND', generate corrective recommendations to get them back on track.\n");
                prompt.append("- If Status is 'FAILED', generate a strict recovery plan to prevent further overages.\n");


                prompt.append("\nGenerate ONLY the requested timeframe recommendations for the categories listed below. ");
                prompt.append("Never generate duplicate recommendations. Always generate personalized, actionable tips mathematically linked to their footprint and goals.\n");
                prompt.append("Requested Tips:\n");
                for (java.util.Map.Entry<String, List<String>> entry : neededTips.entrySet()) {
                    prompt.append("- ").append(entry.getKey()).append(": ").append(String.join(", ", entry.getValue())).append("\n");
                }

                prompt.append("\nFormat STRICTLY as a JSON array where each object has 'category', 'recommendationText' (a main overarching analysis), and the requested timeframe tips ('dailyTip', 'weeklyTip', 'monthlyTip', 'yearlyTip' - only include the ones requested). Do NOT wrap in markdown block.");

                String aiResponse = geminiService.generateAIResponse(prompt.toString());
                if (aiResponse != null && !aiResponse.trim().isEmpty()) {
                    String cleanJson = aiResponse.replace("```json", "").replace("```", "").trim();
                    com.fasterxml.jackson.databind.JsonNode rootArray = objectMapper.readTree(cleanJson);
                    
                    if (rootArray.isArray()) {
                        for (com.fasterxml.jackson.databind.JsonNode node : rootArray) {
                            String category = node.path("category").asText();
                            
                            // Save to cache
                            saveTipToCacheIfPresent(node, "dailyTip", "DAILY", user.getId(), category, lastDailyActivity, cachedTips);
                            saveTipToCacheIfPresent(node, "weeklyTip", "WEEKLY", user.getId(), category, lastWeeklyActivity, cachedTips);
                            saveTipToCacheIfPresent(node, "monthlyTip", "MONTHLY", user.getId(), category, lastMonthlyActivity, cachedTips);
                            saveTipToCacheIfPresent(node, "yearlyTip", "YEARLY", user.getId(), category, lastYearlyActivity, cachedTips);
                            saveTipToCacheIfPresent(node, "recommendationText", "MAIN", user.getId(), category, lastMonthlyActivity, cachedTips);
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to generate Dynamic AI recommendations, falling back to local. Error: {}", e.getMessage());
            }
        }

        // Build the final response
        for (Object[] obj : top3) {
            String category = (String) obj[0];
            BigDecimal emission = (BigDecimal) obj[1];
            java.util.Map<String, String> tips = cachedTips.get(category);

            // If Gemini failed or didn't return a specific tip, fallback to local library
            String dailyTip = tips.getOrDefault("DAILY", recommendationLibrary.generateDailyTip(category, emission, recommendationLibrary.getReductionPercentageTarget(category)));
            String weeklyTip = tips.getOrDefault("WEEKLY", recommendationLibrary.generateWeeklyTip(category, emission.multiply(recommendationLibrary.getReductionPercentageTarget(category)).multiply(new BigDecimal("7")).divide(new BigDecimal("30"), 2, java.math.RoundingMode.HALF_UP)));
            String monthlyTip = tips.getOrDefault("MONTHLY", recommendationLibrary.generateMonthlyTip(category, emission.multiply(recommendationLibrary.getReductionPercentageTarget(category)), activeGoals));
            String yearlyTip = tips.getOrDefault("YEARLY", recommendationLibrary.generateYearlyTip(category, emission.multiply(recommendationLibrary.getReductionPercentageTarget(category)).multiply(new BigDecimal("365")).divide(new BigDecimal("30"), 2, java.math.RoundingMode.HALF_UP)));
            String mainRec = tips.getOrDefault("MAIN", recommendationLibrary.generateRecommendationText(category, emission, totalEmissions, activeGoals));

            RecommendationResponseDto localRec = generateRecommendation(category, emission, totalEmissions, activeGoals);
            localRec.setRecommendation(mainRec);
            localRec.setDailyTip(dailyTip);
            localRec.setWeeklyTip(weeklyTip);
            localRec.setMonthlyTip(monthlyTip);
            localRec.setYearlyTip(yearlyTip);
            
            recommendations.add(localRec);
        }

        return recommendations;
    }

    private void checkCacheOrNeed(Long userId, String category, String timeframe, java.time.LocalDateTime lastActivity, List<String> needed, java.util.Map<String, String> cachedTips) {
        java.util.Optional<com.carbonfootprint.entity.RecommendationCache> cacheOpt = recommendationCacheRepository.findByUserIdAndCategoryAndTimeframe(userId, category, timeframe);
        if (cacheOpt.isPresent()) {
            com.carbonfootprint.entity.RecommendationCache cache = cacheOpt.get();
            if (lastActivity == null || (cache.getLastActivityDate() != null && !lastActivity.isAfter(cache.getLastActivityDate()))) {
                cachedTips.put(timeframe, cache.getTipText());
                return;
            }
        }
        needed.add(timeframe);
    }

    private void saveTipToCacheIfPresent(com.fasterxml.jackson.databind.JsonNode node, String jsonKey, String timeframe, Long userId, String category, java.time.LocalDateTime lastActivity, java.util.Map<String, java.util.Map<String, String>> cachedTips) {
        if (node.hasNonNull(jsonKey)) {
            String text = node.path(jsonKey).asText();
            cachedTips.get(category).put(timeframe, text);
            
            com.carbonfootprint.entity.RecommendationCache cache = recommendationCacheRepository.findByUserIdAndCategoryAndTimeframe(userId, category, timeframe)
                    .orElse(com.carbonfootprint.entity.RecommendationCache.builder()
                            .userId(userId)
                            .category(category)
                            .timeframe(timeframe)
                            .build());
            
            cache.setTipText(text);
            cache.setLastActivityDate(lastActivity);
            recommendationCacheRepository.save(cache);
        }
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

    private RecommendationResponseDto generateRecommendation(String category, BigDecimal emission, BigDecimal totalEmissions, List<Goal> activeGoals) {
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

        BigDecimal reductionTarget = recommendationLibrary.getReductionPercentageTarget(category);
        
        BigDecimal monthly = emission.multiply(reductionTarget).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal weekly = monthly.multiply(new BigDecimal("7")).divide(new BigDecimal("30"), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal yearly = monthly.multiply(new BigDecimal("365")).divide(new BigDecimal("30"), 2, java.math.RoundingMode.HALF_UP);

        // Call the data-driven library methods
        String recText = recommendationLibrary.generateRecommendationText(category, emission, totalEmissions, activeGoals);
        String dailyTip = recommendationLibrary.generateDailyTip(category, emission, reductionTarget);
        String weeklyTip = recommendationLibrary.generateWeeklyTip(category, weekly);
        String monthlyTip = recommendationLibrary.generateMonthlyTip(category, monthly, activeGoals);
        String yearlyTip = recommendationLibrary.generateYearlyTip(category, yearly);

        return RecommendationResponseDto.builder()
                .activity(category)
                .emission(emission)
                .impactLevel(impact)
                .recommendation(recText)
                .dailyTip(dailyTip)
                .weeklyTip(weeklyTip)
                .monthlyTip(monthlyTip)
                .yearlyTip(yearlyTip)
                .potentialWeeklyReduction(weekly)
                .potentialMonthlyReduction(monthly)
                .potentialYearlyReduction(yearly)
                .reductionPercentageTarget(reductionTarget)
                .difficultyLevel(difficulty)
                .priorityScore(priority)
                .build();
    }
    private String mapGoalTypeToCategory(com.carbonfootprint.entity.GoalType type) {
        switch (type) {
            case TRANSPORT: return "Transport";
            case ELECTRICITY: return "Home Energy";
            case FOOD: return "Food & Diet";
            case SHOPPING: return "Shopping";
            default: return "Other";
        }
    }
}
