package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.GoalAnalyticsDTO;
import com.carbonfootprint.entity.ActivityLog;
import com.carbonfootprint.entity.ActivityType;
import com.carbonfootprint.entity.Goal;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.GoalRepository;
import com.carbonfootprint.service.GoalAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoalAnalyticsServiceImpl implements GoalAnalyticsService {

    private final GoalRepository goalRepository;
    private final ActivityLogRepository activityLogRepository;
    private final GeminiService geminiService;

    @Override
    @Transactional(readOnly = true)
    public GoalAnalyticsDTO getGoalAnalytics(Long goalId, Long userId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Goal not found or access denied");
        }

        LocalDate startDate = goal.getStartDate();
        LocalDate targetDate = goal.getTargetDate();
        LocalDate today = LocalDate.now();
        
        long totalDays = Math.max(1, ChronoUnit.DAYS.between(startDate, targetDate));
        long daysRemaining = Math.max(0, ChronoUnit.DAYS.between(today, targetDate));
        
        BigDecimal targetEmission = goal.getTargetEmission() != null ? goal.getTargetEmission() : BigDecimal.ZERO;
        
        List<ActivityLog> logsInWindow = activityLogRepository.findByUserIdAndDateBetween(userId, startDate, targetDate);
        
        // Calculate current progress strictly within window
        BigDecimal currentProgress = logsInWindow.stream()
                .map(ActivityLog::getEmissionValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal progressPercent = BigDecimal.ZERO;
        if (targetEmission.compareTo(BigDecimal.ZERO) > 0) {
            progressPercent = currentProgress.divide(targetEmission, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
        }

        // Calculate Weekly Progress (last 7 days within window)
        LocalDate oneWeekAgo = today.minusDays(7);
        if (oneWeekAgo.isBefore(startDate)) oneWeekAgo = startDate;
        
        LocalDate finalOneWeekAgo = oneWeekAgo;
        BigDecimal weeklyProgress = logsInWindow.stream()
                .filter(log -> !log.getLogDate().isBefore(finalOneWeekAgo) && !log.getLogDate().isAfter(today))
                .map(ActivityLog::getEmissionValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Timeline Data
        List<GoalAnalyticsDTO.TimelineDataPoint> timeline = buildTimeline(startDate, targetDate, today, logsInWindow, targetEmission, totalDays);
        
        // Category Shares
        List<GoalAnalyticsDTO.CategoryShare> categoryShares = buildCategoryShares(logsInWindow, currentProgress, today);
        
        // Intelligence Module
        GoalAnalyticsDTO.GoalIntelligence intelligence = buildIntelligence(categoryShares, goal);

        return GoalAnalyticsDTO.builder()
                .goalId(goal.getId())
                .currentProgress(currentProgress.setScale(2, RoundingMode.HALF_UP))
                .targetEmission(targetEmission.setScale(2, RoundingMode.HALF_UP))
                .progressPercent(progressPercent.setScale(1, RoundingMode.HALF_UP))
                .remainingDays(daysRemaining)
                .totalDays(totalDays)
                .weeklyProgress(weeklyProgress.setScale(2, RoundingMode.HALF_UP))
                .timeline(timeline)
                .categoryShares(categoryShares)
                .intelligence(intelligence)
                .build();
    }

    private GoalAnalyticsDTO.GoalIntelligence buildIntelligence(List<GoalAnalyticsDTO.CategoryShare> categoryShares, Goal goal) {
        if (categoryShares == null || categoryShares.isEmpty()) {
            return null;
        }

        // Sort by total emissions
        List<GoalAnalyticsDTO.CategoryShare> byEmissionsDesc = new ArrayList<>(categoryShares);
        byEmissionsDesc.sort((a, b) -> b.getEmissions().compareTo(a.getEmissions()));
        
        String highestEmissionCategory = byEmissionsDesc.get(0).getCategory();
        String lowestEmissionCategory = byEmissionsDesc.get(byEmissionsDesc.size() - 1).getCategory();

        // Sort by trend (worst first = biggest INCREASE, best first = biggest DECREASE)
        List<GoalAnalyticsDTO.CategoryShare> byTrendWorstFirst = new ArrayList<>(categoryShares);
        byTrendWorstFirst.sort((a, b) -> {
            BigDecimal aVal = a.getTrend().equals("INCREASE") ? a.getTrendValue() : (a.getTrend().equals("DECREASE") ? a.getTrendValue().negate() : BigDecimal.ZERO);
            BigDecimal bVal = b.getTrend().equals("INCREASE") ? b.getTrendValue() : (b.getTrend().equals("DECREASE") ? b.getTrendValue().negate() : BigDecimal.ZERO);
            return bVal.compareTo(aVal);
        });

        String worstCategory = byTrendWorstFirst.get(0).getCategory();
        String mostImprovedCategory = byTrendWorstFirst.get(byTrendWorstFirst.size() - 1).getCategory();
        
        if (byTrendWorstFirst.get(0).getTrend().equals("DECREASE") || byTrendWorstFirst.get(0).getTrend().equals("STABLE")) {
            worstCategory = "None";
        }
        if (byTrendWorstFirst.get(byTrendWorstFirst.size() - 1).getTrend().equals("INCREASE") || byTrendWorstFirst.get(byTrendWorstFirst.size() - 1).getTrend().equals("STABLE")) {
            mostImprovedCategory = "None";
        }

        List<String> topPriorityActions = new ArrayList<>();
        List<String> mediumPriorityActions = new ArrayList<>();
        List<String> lowPriorityActions = new ArrayList<>();
        List<String> personalizedSuggestions = new ArrayList<>();

        if (!worstCategory.equals("None")) {
            topPriorityActions.add("Reduce " + worstCategory + " emissions immediately (Spiked recently)");
        }
        topPriorityActions.add("Target " + highestEmissionCategory + " for highest impact");
        
        if (!byEmissionsDesc.get(0).getCategory().equals(worstCategory) && byEmissionsDesc.size() > 1) {
            mediumPriorityActions.add("Optimize " + byEmissionsDesc.get(1).getCategory() + " routines");
        }
        lowPriorityActions.add("Maintain current levels in " + lowestEmissionCategory);

        GoalAnalyticsDTO.CategoryShare highestShare = byEmissionsDesc.get(0);
        
        try {
            String prompt = "You are an expert environmental scientist. The user has a goal to reduce emissions. " +
                            "Their highest emission category is " + highestEmissionCategory + " contributing " + 
                            highestShare.getPercentage() + "% (" + highestShare.getEmissions() + " kg CO2e) of their footprint. " +
                            "Their target emission for the goal is " + goal.getTargetEmission() + " kg CO2e. " +
                            "Generate exactly 4 extremely concise, actionable bullet points to help them reach their goal. " +
                            "The 4 points must be categorized by timeframe: 1 Daily, 1 Weekly, 1 Monthly, 1 Yearly. " +
                            "Return ONLY a JSON array of 4 strings. No markdown, no extra text.";
                            
            String aiResponse = geminiService.generateAIResponse(prompt);
            
            if (aiResponse != null && !aiResponse.trim().isEmpty()) {
                // Try to parse as JSON array, otherwise fallback to splitting by newline
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    List<String> points = mapper.readValue(aiResponse, new com.fasterxml.jackson.core.type.TypeReference<List<String>>(){});
                    for (String pt : points) {
                        personalizedSuggestions.add(pt + " ✨");
                    }
                } catch (Exception parseEx) {
                    // Fallback to manual parsing
                    String[] lines = aiResponse.replace("[", "").replace("]", "").replace("\"", "").split(",");
                    for (String line : lines) {
                        if (!line.trim().isEmpty()) {
                            personalizedSuggestions.add(line.trim() + " ✨");
                        }
                    }
                }
            } else {
                throw new Exception("Empty AI response");
            }
        } catch (Exception e) {
            log.warn("Failed to generate AI intelligence, falling back to static logic. Error: {}", e.getMessage());
            
            // Dynamic premium local algorithm
            BigDecimal tenPercentReduction = highestShare.getEmissions().multiply(BigDecimal.valueOf(0.10));
            
            BigDecimal targetEmission = goal.getTargetEmission() != null ? goal.getTargetEmission() : BigDecimal.ZERO;
            if (goal.getTargetEmission() != null && targetEmission.compareTo(BigDecimal.ZERO) > 0) {
                long totalDays = ChronoUnit.DAYS.between(goal.getStartDate(), goal.getTargetDate());
                totalDays = totalDays > 0 ? totalDays : 1;
                
                BigDecimal idealBurn = targetEmission.divide(BigDecimal.valueOf(totalDays), 4, RoundingMode.HALF_UP);
                
                if (idealBurn.compareTo(BigDecimal.ZERO) > 0) {
                    long daysSaved = tenPercentReduction.divide(idealBurn, 0, RoundingMode.HALF_UP).longValue();
                    
                    if (daysSaved > 0) {
                        personalizedSuggestions.add(String.format("💡 Strategic Insight: %s constitutes %.1f%% of your footprint. Shifting habits to cut these emissions by just 10%% weekly accelerates your goal timeline by %d days.", 
                                highestEmissionCategory, highestShare.getPercentage(), daysSaved));
                    } else {
                        personalizedSuggestions.add(String.format("💡 Efficiency Opportunity: Minimizing %s by 10%% will establish a robust safety margin, keeping your trajectory completely optimal.", 
                                highestEmissionCategory));
                    }
                }
            } else {
                personalizedSuggestions.add(String.format("💡 Focus Area: Prioritize reducing %s, as it currently dominates %.1f%% of your total tracked emissions.", 
                        highestEmissionCategory, highestShare.getPercentage()));
            }
            
            // Add a secondary dynamic insight based on trend
            if (highestShare.getTrend().equals("INCREASE")) {
                personalizedSuggestions.add(String.format("⚠️ Urgent Course Correction: %s emissions spiked recently (+%s kg CO2e). Immediate reduction is required to stay on target.", 
                        highestEmissionCategory, highestShare.getTrendValue().setScale(1, RoundingMode.HALF_UP)));
            } else if (highestShare.getTrend().equals("DECREASE")) {
                personalizedSuggestions.add(String.format("✅ Positive Momentum: Excellent work reducing %s emissions. Maintain this trajectory to secure your goal.", 
                        highestEmissionCategory));
            }
        }

        return GoalAnalyticsDTO.GoalIntelligence.builder()
                .highestEmissionCategory(highestEmissionCategory)
                .lowestEmissionCategory(lowestEmissionCategory)
                .mostImprovedCategory(mostImprovedCategory)
                .worstCategory(worstCategory)
                .topPriorityActions(topPriorityActions)
                .mediumPriorityActions(mediumPriorityActions)
                .lowPriorityActions(lowPriorityActions)
                .personalizedSuggestions(personalizedSuggestions)
                .build();
    }

    private List<GoalAnalyticsDTO.TimelineDataPoint> buildTimeline(
            LocalDate start, LocalDate target, LocalDate today, 
            List<ActivityLog> logs, BigDecimal targetEmission, long totalDays) {
            
        List<GoalAnalyticsDTO.TimelineDataPoint> timeline = new ArrayList<>();
        
        Map<LocalDate, BigDecimal> dailyEmissions = new HashMap<>();
        for (ActivityLog log : logs) {
            dailyEmissions.merge(log.getLogDate(), log.getEmissionValue(), BigDecimal::add);
        }

        BigDecimal cumulativeEmissions = BigDecimal.ZERO;
        BigDecimal idealDailyBurn = targetEmission.divide(BigDecimal.valueOf(totalDays), 4, RoundingMode.HALF_UP);
        BigDecimal cumulativeIdeal = BigDecimal.ZERO;
        
        LocalDate current = start;
        int weekCount = 0;
        
        while (!current.isAfter(today) && !current.isAfter(target)) {
            cumulativeEmissions = cumulativeEmissions.add(dailyEmissions.getOrDefault(current, BigDecimal.ZERO));
            cumulativeIdeal = cumulativeIdeal.add(idealDailyBurn);
            
            long daysSinceStart = ChronoUnit.DAYS.between(start, current);
            
            if (daysSinceStart == 0) {
                if (current.equals(today)) {
                    timeline.add(GoalAnalyticsDTO.TimelineDataPoint.builder()
                            .label("Goal Created (Current)")
                            .date(current.toString())
                            .cumulativeEmissions(cumulativeEmissions.setScale(2, RoundingMode.HALF_UP))
                            .idealBurn(cumulativeIdeal.setScale(2, RoundingMode.HALF_UP))
                            .build());
                } else {
                    timeline.add(GoalAnalyticsDTO.TimelineDataPoint.builder()
                            .label("Goal Created")
                            .date(current.toString())
                            .cumulativeEmissions(cumulativeEmissions.setScale(2, RoundingMode.HALF_UP))
                            .idealBurn(cumulativeIdeal.setScale(2, RoundingMode.HALF_UP))
                            .build());
                }
            } else if (current.equals(today) || current.equals(target)) {
                timeline.add(GoalAnalyticsDTO.TimelineDataPoint.builder()
                        .label("Current Progress")
                        .date(current.toString())
                        .cumulativeEmissions(cumulativeEmissions.setScale(2, RoundingMode.HALF_UP))
                        .idealBurn(cumulativeIdeal.setScale(2, RoundingMode.HALF_UP))
                        .build());
            } else if (daysSinceStart % 7 == 0) {
                weekCount++;
                timeline.add(GoalAnalyticsDTO.TimelineDataPoint.builder()
                        .label("Week " + weekCount + " Progress")
                        .date(current.toString())
                        .cumulativeEmissions(cumulativeEmissions.setScale(2, RoundingMode.HALF_UP))
                        .idealBurn(cumulativeIdeal.setScale(2, RoundingMode.HALF_UP))
                        .build());
            }
            
            current = current.plusDays(1);
        }
        
        return timeline;
    }

    private List<GoalAnalyticsDTO.CategoryShare> buildCategoryShares(List<ActivityLog> logs, BigDecimal totalProgress, LocalDate today) {
        Map<String, BigDecimal> categoryTotals = new HashMap<>();
        Map<String, BigDecimal> thisWeekTotals = new HashMap<>();
        Map<String, BigDecimal> lastWeekTotals = new HashMap<>();
        
        LocalDate oneWeekAgo = today.minusDays(7);
        LocalDate twoWeeksAgo = today.minusDays(14);
        
        for (ActivityLog log : logs) {
            String categoryName = log.getActivityType().getSubCategory().getCategory().getName();
            
            categoryTotals.merge(categoryName, log.getEmissionValue(), BigDecimal::add);
            
            LocalDate logDate = log.getLogDate();
            if (!logDate.isAfter(today) && logDate.isAfter(oneWeekAgo)) {
                thisWeekTotals.merge(categoryName, log.getEmissionValue(), BigDecimal::add);
            } else if (!logDate.isAfter(oneWeekAgo) && logDate.isAfter(twoWeeksAgo)) {
                lastWeekTotals.merge(categoryName, log.getEmissionValue(), BigDecimal::add);
            }
        }
        
        return categoryTotals.entrySet().stream()
                .map(entry -> {
                    String category = entry.getKey();
                    BigDecimal totalEmissions = entry.getValue();
                    
                    BigDecimal percentage = BigDecimal.ZERO;
                    if (totalProgress.compareTo(BigDecimal.ZERO) > 0) {
                        percentage = totalEmissions.divide(totalProgress, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
                    }
                    
                    BigDecimal thisWeek = thisWeekTotals.getOrDefault(category, BigDecimal.ZERO);
                    BigDecimal lastWeek = lastWeekTotals.getOrDefault(category, BigDecimal.ZERO);
                    
                    BigDecimal trendValue = thisWeek.subtract(lastWeek);
                    String trend = "STABLE";
                    if (trendValue.compareTo(BigDecimal.ZERO) > 0) trend = "INCREASE";
                    else if (trendValue.compareTo(BigDecimal.ZERO) < 0) trend = "DECREASE";
                    
                    return GoalAnalyticsDTO.CategoryShare.builder()
                            .category(category)
                            .emissions(totalEmissions.setScale(2, RoundingMode.HALF_UP))
                            .percentage(percentage.setScale(1, RoundingMode.HALF_UP))
                            .trend(trend)
                            .trendValue(trendValue.abs().setScale(2, RoundingMode.HALF_UP))
                            .build();
                })
                .sorted((GoalAnalyticsDTO.CategoryShare a, GoalAnalyticsDTO.CategoryShare b) -> b.getEmissions().compareTo(a.getEmissions()))
                .collect(Collectors.toList());
    }
}
