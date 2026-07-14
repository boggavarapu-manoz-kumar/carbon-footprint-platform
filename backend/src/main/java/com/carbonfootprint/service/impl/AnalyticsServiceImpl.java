package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.analytics.AnalyticsResponseDto;
import com.carbonfootprint.dto.analytics.CategoryShareDto;
import com.carbonfootprint.dto.analytics.TimeSeriesDataPointDto;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.OtherActivityLogRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.concurrent.TimeUnit;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ActivityLogRepository activityLogRepository;
    private final OtherActivityLogRepository otherActivityLogRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    @Override
    public AnalyticsResponseDto getDailyAnalytics(String userEmail, LocalDate date, String category) {
        User user = getUserByEmail(userEmail);
        String cacheKey = "analytics:daily:" + user.getId();
        
        AnalyticsResponseDto cachedResponse = null;
        try {
            cachedResponse = (AnalyticsResponseDto) redisTemplate.opsForValue().get(cacheKey);
        } catch (Exception e) {
            log.warn("Redis is unavailable, skipping cache read for key {}", cacheKey);
        }
        
        if (cachedResponse != null) {
            log.info("Returning DAILY analytics from Redis cache for user {}", user.getId());
            return cachedResponse;
        }

        LocalDate startDate = date;
        LocalDate endDate = date;
        LocalDate prevStartDate = date.minusDays(1);
        LocalDate prevEndDate = date.minusDays(1);

        AnalyticsResponseDto response = calculateAnalytics(user.getId(), startDate, endDate, prevStartDate, prevEndDate, "Daily - " + date.toString(), true);
        
        try {
            redisTemplate.opsForValue().set(cacheKey, response, 1, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.warn("Redis is unavailable, skipping cache write for key {}", cacheKey);
        }
        return response;
    }

    @Override
    public AnalyticsResponseDto getWeeklyAnalytics(String userEmail, LocalDate date, String category) {
        User user = getUserByEmail(userEmail);
        String cacheKey = "analytics:weekly:" + user.getId();
        
        AnalyticsResponseDto cachedResponse = null;
        try {
            cachedResponse = (AnalyticsResponseDto) redisTemplate.opsForValue().get(cacheKey);
        } catch (Exception e) {
            log.warn("Redis is unavailable, skipping cache read for key {}", cacheKey);
        }

        if (cachedResponse != null) {
            log.info("Returning WEEKLY analytics from Redis cache for user {}", user.getId());
            return cachedResponse;
        }

        LocalDate startDate = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endDate = date.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        LocalDate prevStartDate = startDate.minusWeeks(1);
        LocalDate prevEndDate = endDate.minusWeeks(1);

        AnalyticsResponseDto response = calculateAnalytics(user.getId(), startDate, endDate, prevStartDate, prevEndDate, "Week of " + startDate.toString(), true);
        
        try {
            redisTemplate.opsForValue().set(cacheKey, response, 5, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.warn("Redis is unavailable, skipping cache write for key {}", cacheKey);
        }
        return response;
    }

    @Override
    public AnalyticsResponseDto getMonthlyAnalytics(String userEmail, LocalDate date, String category) {
        User user = getUserByEmail(userEmail);
        String cacheKey = "analytics:monthly:" + user.getId();
        
        AnalyticsResponseDto cachedResponse = null;
        try {
            cachedResponse = (AnalyticsResponseDto) redisTemplate.opsForValue().get(cacheKey);
        } catch (Exception e) {
            log.warn("Redis is unavailable, skipping cache read for key {}", cacheKey);
        }

        if (cachedResponse != null) {
            log.info("Returning MONTHLY analytics from Redis cache for user {}", user.getId());
            return cachedResponse;
        }

        LocalDate startDate = date.withDayOfMonth(1);
        LocalDate endDate = date.with(TemporalAdjusters.lastDayOfMonth());
        LocalDate prevStartDate = startDate.minusMonths(1);
        LocalDate prevEndDate = endDate.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth());

        AnalyticsResponseDto response = calculateAnalytics(user.getId(), startDate, endDate, prevStartDate, prevEndDate, date.format(DateTimeFormatter.ofPattern("MMMM yyyy")), true);
        
        try {
            redisTemplate.opsForValue().set(cacheKey, response, 10, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.warn("Redis is unavailable, skipping cache write for key {}", cacheKey);
        }
        return response;
    }

    @Override
    public AnalyticsResponseDto getYearlyAnalytics(String userEmail, Integer year, String category) {
        User user = getUserByEmail(userEmail);
        
        List<Object[]> categoryData = activityLogRepository.sumEmissionsByCategoryAndDateRange(
                user.getId(), LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31));
        
        List<Object[]> monthlyData = activityLogRepository.sumEmissionsGroupedByMonth(user.getId(), year);

        BigDecimal totalEmissions = BigDecimal.ZERO;
        List<CategoryShareDto> categoryShares = new ArrayList<>();
        
        for (Object[] row : categoryData) {
            String cat = (String) row[0];
            BigDecimal val = (BigDecimal) row[1];
            if (val != null) {
                totalEmissions = totalEmissions.add(val);
                categoryShares.add(CategoryShareDto.builder().category(cat).emissions(val).build());
            }
        }
        
        BigDecimal otherCatSum = otherActivityLogRepository.sumEmissionsByUserIdAndDateRange(user.getId(), LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31));
        if (otherCatSum != null && otherCatSum.compareTo(BigDecimal.ZERO) > 0) {
            totalEmissions = totalEmissions.add(otherCatSum);
            categoryShares.add(CategoryShareDto.builder().category("Other").emissions(otherCatSum).build());
        }

        List<Object[]> otherMonthlyData = otherActivityLogRepository.sumEmissionsGroupedByMonth(user.getId(), year);
        java.util.Map<Integer, BigDecimal> mergedMonthlyData = new java.util.TreeMap<>();
        
        for (Object[] row : monthlyData) {
            mergedMonthlyData.put((Integer) row[0], (BigDecimal) row[1]);
        }
        for (Object[] row : otherMonthlyData) {
            Integer m = (Integer) row[0];
            BigDecimal val = (BigDecimal) row[1];
            mergedMonthlyData.put(m, mergedMonthlyData.getOrDefault(m, BigDecimal.ZERO).add(val != null ? val : BigDecimal.ZERO));
        }

        // Calculate percentages
        if (totalEmissions.compareTo(BigDecimal.ZERO) > 0) {
            for (CategoryShareDto share : categoryShares) {
                double pct = share.getEmissions().doubleValue() / totalEmissions.doubleValue() * 100.0;
                share.setPercentage(Math.round(pct * 100.0) / 100.0);
            }
        }

        List<TimeSeriesDataPointDto> timeline = new ArrayList<>();
        for (java.util.Map.Entry<Integer, BigDecimal> entry : mergedMonthlyData.entrySet()) {
            Integer month = entry.getKey();
            BigDecimal val = entry.getValue();
            String rawMonthName = java.time.Month.of(month).toString().substring(0, 3);
            String monthName = rawMonthName.substring(0, 1).toUpperCase() + rawMonthName.substring(1).toLowerCase();
            timeline.add(TimeSeriesDataPointDto.builder().label(monthName).emissions(val != null ? val : BigDecimal.ZERO).build());
        }

        Long totalActivities = activityLogRepository.countActivitiesByUserIdAndDateRange(user.getId(), LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31));
        Long otherActivities = otherActivityLogRepository.countActivitiesByUserIdAndDateRange(user.getId(), LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31));
        if (totalActivities == null) totalActivities = 0L;
        if (otherActivities != null) totalActivities += otherActivities;

        BigDecimal prevEmissions = activityLogRepository.sumEmissionsByUserIdAndDateRange(user.getId(), LocalDate.of(year - 1, 1, 1), LocalDate.of(year - 1, 12, 31));
        BigDecimal otherPrevEmissions = otherActivityLogRepository.sumEmissionsByUserIdAndDateRange(user.getId(), LocalDate.of(year - 1, 1, 1), LocalDate.of(year - 1, 12, 31));
        if (prevEmissions == null) prevEmissions = BigDecimal.ZERO;
        if (otherPrevEmissions != null) prevEmissions = prevEmissions.add(otherPrevEmissions);
        
        Double popChange = 0.0;
        if (prevEmissions.compareTo(BigDecimal.ZERO) > 0) {
            popChange = (totalEmissions.doubleValue() - prevEmissions.doubleValue()) / prevEmissions.doubleValue() * 100.0;
        } else if (totalEmissions.compareTo(BigDecimal.ZERO) > 0) {
            popChange = 100.0;
        }

        return AnalyticsResponseDto.builder()
                .timePeriod(year.toString())
                .totalEmissions(totalEmissions)
                .totalActivities(totalActivities != null ? totalActivities : 0L)
                .categoryShares(categoryShares)
                .timeline(timeline)
                .periodOverPeriodChange(popChange)
                .build();
    }

    @Override
    public List<Integer> getAvailableYears(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<Integer> years1 = activityLogRepository.findDistinctYearsByUserId(user.getId());
        List<Integer> years2 = otherActivityLogRepository.findDistinctYearsByUserId(user.getId());
        java.util.Set<Integer> allYears = new java.util.TreeSet<>(java.util.Collections.reverseOrder());
        if (years1 != null) allYears.addAll(years1);
        if (years2 != null) allYears.addAll(years2);
        return new ArrayList<>(allYears);
    }

    private AnalyticsResponseDto calculateAnalytics(Long userId, LocalDate startDate, LocalDate endDate, LocalDate prevStartDate, LocalDate prevEndDate, String timePeriodLabel, boolean includeTimeline) {
        List<Object[]> categoryData = activityLogRepository.sumEmissionsByCategoryAndDateRange(userId, startDate, endDate);
        
        BigDecimal totalEmissions = BigDecimal.ZERO;
        List<CategoryShareDto> categoryShares = new ArrayList<>();
        
        for (Object[] row : categoryData) {
            String cat = (String) row[0];
            BigDecimal val = (BigDecimal) row[1];
            if (val != null) {
                totalEmissions = totalEmissions.add(val);
                categoryShares.add(CategoryShareDto.builder().category(cat).emissions(val).build());
            }
        }
        
        BigDecimal otherCatSum = otherActivityLogRepository.sumEmissionsByUserIdAndDateRange(userId, startDate, endDate);
        if (otherCatSum != null && otherCatSum.compareTo(BigDecimal.ZERO) > 0) {
            totalEmissions = totalEmissions.add(otherCatSum);
            categoryShares.add(CategoryShareDto.builder().category("Other").emissions(otherCatSum).build());
        }

        if (totalEmissions.compareTo(BigDecimal.ZERO) > 0) {
            for (CategoryShareDto share : categoryShares) {
                double pct = share.getEmissions().doubleValue() / totalEmissions.doubleValue() * 100.0;
                share.setPercentage(Math.round(pct * 100.0) / 100.0);
            }
        }

        List<TimeSeriesDataPointDto> timeline = new ArrayList<>();
        if (includeTimeline) {
            if (startDate.equals(endDate)) {
                // Build a map of hour -> emissions from actual DB data
                java.util.List<com.carbonfootprint.entity.ActivityLog> dailyLogs = activityLogRepository.findByUserIdAndLogDate(userId, startDate);
                java.util.Map<Integer, BigDecimal> hourMap = new java.util.TreeMap<>();
                
                // Determine user's local timezone offset (assuming IST +05:30 for this local execution)
                java.time.ZoneId localZone = java.time.ZoneId.of("Asia/Kolkata");
                
                for (com.carbonfootprint.entity.ActivityLog log : dailyLogs) {
                    if (log.getCreatedAt() != null) {
                        // The DB stored the time in UTC (e.g. 10:10 UTC -> 15:40 IST)
                        int hour = log.getCreatedAt().atZone(java.time.ZoneOffset.UTC).withZoneSameInstant(localZone).getHour();
                        hourMap.put(hour, hourMap.getOrDefault(hour, BigDecimal.ZERO).add(log.getEmissionValue()));
                    }
                }
                
                java.util.List<com.carbonfootprint.entity.OtherActivityLog> otherDailyLogs = otherActivityLogRepository.findByUserIdAndLogDate(userId, startDate);
                for (com.carbonfootprint.entity.OtherActivityLog log : otherDailyLogs) {
                    if (log.getCreatedAt() != null) {
                        int hour = log.getCreatedAt().atZone(java.time.ZoneOffset.UTC).withZoneSameInstant(localZone).getHour();
                        hourMap.put(hour, hourMap.getOrDefault(hour, BigDecimal.ZERO).add(log.getCarbonValue() != null ? log.getCarbonValue() : BigDecimal.ZERO));
                    }
                }
                // Always output all 24 hours so the chart is always a full day view
                for (int h = 0; h < 24; h++) {
                    String label = String.format("%02d:00", h);
                    BigDecimal val = hourMap.getOrDefault(h, BigDecimal.ZERO);
                    timeline.add(TimeSeriesDataPointDto.builder().label(label).emissions(val).build());
                }
            } else {
                boolean isWeekly = (java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) == 6);
                boolean isMonthly = (java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) > 27);
                List<Object[]> dateData = activityLogRepository.sumEmissionsGroupedByDate(userId, startDate, endDate);
                
                if (isMonthly) {
                    java.util.Map<Integer, BigDecimal> weekAggregations = new java.util.TreeMap<>();
                    for (Object[] row : dateData) {
                        java.sql.Date sqlDate = (java.sql.Date) row[0];
                        BigDecimal val = (BigDecimal) row[1];
                        int dayOfMonth = sqlDate.toLocalDate().getDayOfMonth();
                        int week = ((dayOfMonth - 1) / 7) + 1;
                        weekAggregations.put(week, weekAggregations.getOrDefault(week, BigDecimal.ZERO).add(val != null ? val : BigDecimal.ZERO));
                    }
                    for (int i = 1; i <= 5; i++) {
                        if (i == 5 && weekAggregations.getOrDefault(5, BigDecimal.ZERO).compareTo(BigDecimal.ZERO) == 0) continue;
                        timeline.add(TimeSeriesDataPointDto.builder().label("Week " + i).emissions(weekAggregations.getOrDefault(i, BigDecimal.ZERO)).build());
                    }
                    
                    // Merge OtherActivityLog emissions into the weekly buckets
                    List<Object[]> otherDateData = otherActivityLogRepository.sumEmissionsGroupedByDate(userId, startDate, endDate);
                    java.util.Map<String, BigDecimal> mergedDateData = new java.util.LinkedHashMap<>();
                    for (TimeSeriesDataPointDto pt : timeline) {
                        mergedDateData.put(pt.getLabel(), pt.getEmissions());
                    }
                    for (Object[] row : otherDateData) {
                        java.sql.Date sqlDate = (java.sql.Date) row[0];
                        BigDecimal val = (BigDecimal) row[1];
                        int dayOfMonth = sqlDate.toLocalDate().getDayOfMonth();
                        int week = ((dayOfMonth - 1) / 7) + 1;
                        String label = "Week " + week;
                        mergedDateData.put(label, mergedDateData.getOrDefault(label, BigDecimal.ZERO).add(val != null ? val : BigDecimal.ZERO));
                    }
                    timeline.clear();
                    for (java.util.Map.Entry<String, BigDecimal> entry : mergedDateData.entrySet()) {
                        timeline.add(TimeSeriesDataPointDto.builder().label(entry.getKey()).emissions(entry.getValue()).build());
                    }
                } else {
                    for (Object[] row : dateData) {
                        java.sql.Date sqlDate = (java.sql.Date) row[0];
                        BigDecimal val = (BigDecimal) row[1];
                        String label;
                        if (isWeekly) {
                            label = sqlDate.toLocalDate().format(DateTimeFormatter.ofPattern("EEE (MMM dd)"));
                        } else {
                            label = sqlDate.toLocalDate().format(DateTimeFormatter.ofPattern("MMM dd"));
                        }
                        timeline.add(TimeSeriesDataPointDto.builder().label(label).emissions(val != null ? val : BigDecimal.ZERO).build());
                    }
                    
                    List<Object[]> otherDateData = otherActivityLogRepository.sumEmissionsGroupedByDate(userId, startDate, endDate);
                    java.util.Map<String, BigDecimal> mergedDateData = new java.util.LinkedHashMap<>();
                    for (TimeSeriesDataPointDto pt : timeline) {
                        mergedDateData.put(pt.getLabel(), pt.getEmissions());
                    }
                    for (Object[] row : otherDateData) {
                        java.sql.Date sqlDate = (java.sql.Date) row[0];
                        BigDecimal val = (BigDecimal) row[1];
                        String label;
                        if (isWeekly) {
                            label = sqlDate.toLocalDate().format(DateTimeFormatter.ofPattern("EEE (MMM dd)"));
                        } else {
                            label = sqlDate.toLocalDate().format(DateTimeFormatter.ofPattern("MMM dd"));
                        }
                        mergedDateData.put(label, mergedDateData.getOrDefault(label, BigDecimal.ZERO).add(val != null ? val : BigDecimal.ZERO));
                    }
                    timeline.clear();
                    for (java.util.Map.Entry<String, BigDecimal> entry : mergedDateData.entrySet()) {
                        timeline.add(TimeSeriesDataPointDto.builder().label(entry.getKey()).emissions(entry.getValue()).build());
                    }
                }
            }
        }

        Long totalActivities = activityLogRepository.countActivitiesByUserIdAndDateRange(userId, startDate, endDate);
        Long otherActivities = otherActivityLogRepository.countActivitiesByUserIdAndDateRange(userId, startDate, endDate);
        if (totalActivities == null) totalActivities = 0L;
        if (otherActivities != null) totalActivities += otherActivities;

        BigDecimal prevEmissions = activityLogRepository.sumEmissionsByUserIdAndDateRange(userId, prevStartDate, prevEndDate);
        BigDecimal otherPrevEmissions = otherActivityLogRepository.sumEmissionsByUserIdAndDateRange(userId, prevStartDate, prevEndDate);
        if (prevEmissions == null) prevEmissions = BigDecimal.ZERO;
        if (otherPrevEmissions != null) prevEmissions = prevEmissions.add(otherPrevEmissions);
        
        Double popChange = 0.0;
        if (prevEmissions.compareTo(BigDecimal.ZERO) > 0) {
            popChange = (totalEmissions.doubleValue() - prevEmissions.doubleValue()) / prevEmissions.doubleValue() * 100.0;
        } else if (totalEmissions.compareTo(BigDecimal.ZERO) > 0) {
            popChange = 100.0;
        }

        // 4. Populate exact raw activities for Daily timeline visualization
        List<com.carbonfootprint.dto.analytics.DailyTimelineActivityDto> rawActivities = null;
        if (includeTimeline && startDate.equals(endDate)) {
            rawActivities = new java.util.ArrayList<>();
            java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("hh:mm a");
            List<com.carbonfootprint.entity.ActivityLog> logsForRaw = activityLogRepository.findByUserIdAndLogDate(userId, startDate);
            for (com.carbonfootprint.entity.ActivityLog log : logsForRaw) {
                if (log.getCreatedAt() != null) {
                    java.time.ZonedDateTime zdt = log.getCreatedAt().atZone(java.time.ZoneId.systemDefault());
                    rawActivities.add(com.carbonfootprint.dto.analytics.DailyTimelineActivityDto.builder()
                            .id(log.getId())
                            .activityName(log.getActivityType().getName())
                            .categoryName(log.getActivityType().getSubCategory().getCategory().getName())
                            .emissionValue(log.getEmissionValue())
                            .formattedTime(zdt.format(timeFormatter))
                            .timestamp(zdt.toInstant().toEpochMilli())
                            .build());
                }
            }
            java.util.List<com.carbonfootprint.entity.OtherActivityLog> otherLogsForRaw = otherActivityLogRepository.findByUserIdAndLogDate(userId, startDate);
            for (com.carbonfootprint.entity.OtherActivityLog log : otherLogsForRaw) {
                if (log.getCreatedAt() != null) {
                    java.time.ZonedDateTime zdt = log.getCreatedAt().atZone(java.time.ZoneId.systemDefault());
                    rawActivities.add(com.carbonfootprint.dto.analytics.DailyTimelineActivityDto.builder()
                            .id(log.getId())
                            .activityName(log.getActivityName())
                            .categoryName("Other")
                            .emissionValue(log.getCarbonValue() != null ? log.getCarbonValue() : BigDecimal.ZERO)
                            .formattedTime(zdt.format(timeFormatter))
                            .timestamp(zdt.toInstant().toEpochMilli())
                            .build());
                }
            }
            // Sort combined raw activities by timestamp descending
            rawActivities.sort((a, b) -> Long.compare(b.getTimestamp(), a.getTimestamp()));
        }
        return AnalyticsResponseDto.builder()
                .timePeriod(timePeriodLabel)
                .totalEmissions(totalEmissions)
                .totalActivities(totalActivities != null ? totalActivities : 0L)
                .categoryShares(categoryShares)
                .timeline(timeline)
                .rawActivities(rawActivities)
                .periodOverPeriodChange(popChange)
                .build();
    }
}
