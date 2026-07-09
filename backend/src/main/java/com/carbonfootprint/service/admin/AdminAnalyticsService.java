package com.carbonfootprint.service.admin;

import com.carbonfootprint.dto.admin.*;
import com.carbonfootprint.entity.GoalStatus;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.GoalRepository;
import com.carbonfootprint.repository.UserBadgeRepository;
import com.carbonfootprint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminAnalyticsService {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final GoalRepository goalRepository;
    private final UserBadgeRepository userBadgeRepository;

    private static final String[] MONTH_NAMES = {
        "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    };

    // ─────────────────────────────────────────────────────────────
    // PLATFORM ANALYTICS
    // ─────────────────────────────────────────────────────────────

    @Cacheable(value = "platformAnalytics", key = "'all'")
    public PlatformAnalyticsResponse getPlatformAnalytics() {
        log.info("Fetching Platform Analytics");
        long totalUsers = userRepository.count();
        long totalActivities = activityLogRepository.count();
        BigDecimal totalEmissions = activityLogRepository.sumAllEmissions();
        if (totalEmissions == null) totalEmissions = BigDecimal.ZERO;

        // Users registered in last 30 days = "active" approximation
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long recentUsers = userRepository.countByCreatedAtAfter(thirtyDaysAgo);

        return PlatformAnalyticsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(recentUsers)
                .totalActivities(totalActivities)
                .totalEmissions(totalEmissions)
                .totalGoals(0)
                .completedGoals(0)
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // USER GROWTH ANALYTICS
    // ─────────────────────────────────────────────────────────────

    @Cacheable(value = "userGrowth", key = "#days")
    public List<UserGrowthResponse> getUserGrowth(int days) {
        log.info("Fetching User Growth for last {} days", days);
        LocalDateTime startDate = LocalDate.now().minusDays(days).atStartOfDay();

        List<Object[]> queryResults = userRepository.countUsersGroupedByDate(startDate);
        long totalUsersBefore = userRepository.count() - userRepository.countByCreatedAtAfter(startDate);

        List<UserGrowthResponse> growth = new ArrayList<>();
        long runningTotal = totalUsersBefore;

        Map<LocalDate, Long> dateRegMap = new HashMap<>();
        for (Object[] result : queryResults) {
            java.sql.Date sqlDate = (java.sql.Date) result[0];
            LocalDate date = sqlDate.toLocalDate();
            long count = ((Number) result[1]).longValue();
            dateRegMap.put(date, count);
        }

        for (int i = days; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            long newRegs = dateRegMap.getOrDefault(date, 0L);
            runningTotal += newRegs;
            growth.add(new UserGrowthResponse(date, newRegs, runningTotal));
        }
        return growth;
    }

    // ─────────────────────────────────────────────────────────────
    // USER DEMOGRAPHICS
    // ─────────────────────────────────────────────────────────────

    @Cacheable(value = "userDemographics", key = "'all'")
    public List<UserDemographicsResponse> getUserDemographics() {
        log.info("Fetching User Demographics");
        List<Object[]> results = userRepository.countUsersByGender();
        List<UserDemographicsResponse> response = new ArrayList<>();
        for (Object[] result : results) {
            String gender = (String) result[0];
            long count = ((Number) result[1]).longValue();
            response.add(new UserDemographicsResponse(gender, count));
        }
        return response;
    }

    // ─────────────────────────────────────────────────────────────
    // USER MONTHLY REGISTRATION
    // ─────────────────────────────────────────────────────────────

    @Cacheable(value = "userMonthlyGrowth", key = "#year")
    public List<UserGrowthResponse> getUserMonthlyGrowth(int year) {
        log.info("Fetching User Monthly Growth for year {}", year);
        List<Object[]> results = userRepository.countUsersGroupedByMonth(year);
        Map<Integer, Long> monthMap = new HashMap<>();
        for (Object[] result : results) {
            int month = ((Number) result[0]).intValue();
            long count = ((Number) result[1]).longValue();
            monthMap.put(month, count);
        }
        List<UserGrowthResponse> response = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            long count = monthMap.getOrDefault(m, 0L);
            LocalDate date = LocalDate.of(year, m, 1);
            response.add(new UserGrowthResponse(date, count, 0L));
        }
        return response;
    }

    // ─────────────────────────────────────────────────────────────
    // ACTIVITY TRENDS
    // ─────────────────────────────────────────────────────────────

    @Cacheable(value = "activityTrends", key = "#days")
    public List<ActivityTrendResponse> getActivityTrends(int days) {
        log.info("Fetching Activity Trends for last {} days", days);
        LocalDate startDate = LocalDate.now().minusDays(days);

        List<Object[]> queryResults = activityLogRepository.countActivitiesGroupedByDate(startDate);

        Map<LocalDate, Long> dateActMap = new HashMap<>();
        for (Object[] result : queryResults) {
            java.sql.Date sqlDate = (java.sql.Date) result[0];
            LocalDate date = sqlDate.toLocalDate();
            long count = ((Number) result[1]).longValue();
            dateActMap.put(date, count);
        }

        List<ActivityTrendResponse> trends = new ArrayList<>();
        for (int i = days; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            long activityCount = dateActMap.getOrDefault(date, 0L);
            trends.add(new ActivityTrendResponse(date, activityCount));
        }
        return trends;
    }

    // ─────────────────────────────────────────────────────────────
    // CATEGORY ANALYTICS
    // ─────────────────────────────────────────────────────────────

    @Cacheable(value = "categoryAnalytics", key = "'all'")
    public List<CategoryAnalyticsResponse> getCategoryAnalytics() {
        log.info("Fetching Category Analytics");
        List<Object[]> queryResults = activityLogRepository.sumEmissionsAndCountByCategory();
        List<CategoryAnalyticsResponse> response = new ArrayList<>();
        for (Object[] result : queryResults) {
            String category = (String) result[0];
            BigDecimal totalEmissions = (BigDecimal) result[1];
            long count = ((Number) result[2]).longValue();
            response.add(new CategoryAnalyticsResponse(category, totalEmissions, (int) count));
        }
        return response;
    }

    // ─────────────────────────────────────────────────────────────
    // CARBON TRENDS (Daily)
    // ─────────────────────────────────────────────────────────────

    @Cacheable(value = "carbonTrends", key = "#days")
    public List<CarbonTrendResponse> getCarbonTrends(int days) {
        log.info("Fetching Carbon Trends for last {} days", days);
        LocalDate startDate = LocalDate.now().minusDays(days);
        List<Object[]> results = activityLogRepository.sumEmissionsGroupedByDateGlobal(startDate);

        Map<LocalDate, Object[]> dataMap = new LinkedHashMap<>();
        for (Object[] result : results) {
            java.sql.Date sqlDate = (java.sql.Date) result[0];
            dataMap.put(sqlDate.toLocalDate(), result);
        }

        List<CarbonTrendResponse> response = new ArrayList<>();
        for (int i = days; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            Object[] data = dataMap.get(date);
            BigDecimal emissions = data != null ? (BigDecimal) data[1] : BigDecimal.ZERO;
            if (emissions == null) emissions = BigDecimal.ZERO;
            Long actCount = activityLogRepository.countActivitiesInRange(date, date);
            response.add(new CarbonTrendResponse(date.toString(), emissions, actCount == null ? 0L : actCount));
        }
        return response;
    }

    // ─────────────────────────────────────────────────────────────
    // CARBON TRENDS (Monthly)
    // ─────────────────────────────────────────────────────────────

    @Cacheable(value = "carbonMonthlyTrends", key = "#year")
    public List<CarbonTrendResponse> getCarbonMonthlyTrends(int year) {
        log.info("Fetching Carbon Monthly Trends for year {}", year);
        List<Object[]> results = activityLogRepository.sumEmissionsGroupedByMonthGlobal(year);
        Map<Integer, Object[]> monthMap = new HashMap<>();
        for (Object[] result : results) {
            int month = ((Number) result[0]).intValue();
            monthMap.put(month, result);
        }
        List<CarbonTrendResponse> response = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            Object[] data = monthMap.get(m);
            BigDecimal emissions = data != null ? (BigDecimal) data[1] : BigDecimal.ZERO;
            if (emissions == null) emissions = BigDecimal.ZERO;
            Long count = data != null ? ((Number) data[2]).longValue() : 0L;
            response.add(new CarbonTrendResponse(MONTH_NAMES[m], emissions, count));
        }
        return response;
    }

    // ─────────────────────────────────────────────────────────────
    // ACTIVITY ANALYTICS (by category detail)
    // ─────────────────────────────────────────────────────────────

    @Cacheable(value = "activityAnalytics", key = "'all'")
    public List<ActivityAnalyticsResponse> getActivityAnalytics() {
        log.info("Fetching Activity Analytics by category");
        List<Object[]> results = activityLogRepository.getActivityAnalyticsByCategory();
        List<ActivityAnalyticsResponse> response = new ArrayList<>();
        for (Object[] result : results) {
            String category = (String) result[0];
            Long count = ((Number) result[1]).longValue();
            BigDecimal totalEmissions = (BigDecimal) result[2];
            BigDecimal avgEmissions = (BigDecimal) result[3];
            if (totalEmissions == null) totalEmissions = BigDecimal.ZERO;
            if (avgEmissions == null) avgEmissions = BigDecimal.ZERO;
            response.add(new ActivityAnalyticsResponse(category, count, totalEmissions, avgEmissions));
        }
        return response;
    }

    // ─────────────────────────────────────────────────────────────
    // LEADERBOARD ANALYTICS
    // ─────────────────────────────────────────────────────────────

    @Cacheable(value = "leaderboardAnalytics", key = "#limit")
    public List<LeaderboardAnalyticsResponse> getLeaderboardAnalytics(int limit) {
        log.info("Fetching Leaderboard Analytics top {}", limit);
        List<Object[]> results = activityLogRepository.getLeaderboardAnalytics(PageRequest.of(0, limit));
        List<LeaderboardAnalyticsResponse> response = new ArrayList<>();
        for (Object[] result : results) {
            String username = (String) result[1];
            String firstName = (String) result[2];
            String lastName = (String) result[3];
            BigDecimal totalEmissions = (BigDecimal) result[4];
            Long count = ((Number) result[5]).longValue();
            if (totalEmissions == null) totalEmissions = BigDecimal.ZERO;
            response.add(new LeaderboardAnalyticsResponse(username, firstName, lastName, totalEmissions, count));
        }
        return response;
    }

    // ─────────────────────────────────────────────────────────────
    // TREND ANALYTICS (Period Comparison)
    // ─────────────────────────────────────────────────────────────

    public Map<String, Object> getTrendComparison() {
        log.info("Fetching Trend Comparison Analytics");
        LocalDate today = LocalDate.now();

        LocalDate thisMonthStart = today.withDayOfMonth(1);
        LocalDate lastMonthStart = thisMonthStart.minusMonths(1);
        LocalDate lastMonthEnd = thisMonthStart.minusDays(1);

        BigDecimal thisMonthEmissions = activityLogRepository.sumEmissionsInRange(thisMonthStart, today);
        BigDecimal lastMonthEmissions = activityLogRepository.sumEmissionsInRange(lastMonthStart, lastMonthEnd);
        Long thisMonthActivities = activityLogRepository.countActivitiesInRange(thisMonthStart, today);
        Long lastMonthActivities = activityLogRepository.countActivitiesInRange(lastMonthStart, lastMonthEnd);

        if (thisMonthEmissions == null) thisMonthEmissions = BigDecimal.ZERO;
        if (lastMonthEmissions == null) lastMonthEmissions = BigDecimal.ZERO;
        if (thisMonthActivities == null) thisMonthActivities = 0L;
        if (lastMonthActivities == null) lastMonthActivities = 0L;

        LocalDateTime thisMonthStartDT = thisMonthStart.atStartOfDay();
        LocalDateTime todayEndDT = today.atTime(23, 59, 59);
        LocalDateTime lastMonthStartDT = lastMonthStart.atStartOfDay();
        LocalDateTime lastMonthEndDT = lastMonthEnd.atTime(23, 59, 59);

        Long thisMonthUsers = userRepository.countUsersInRange(thisMonthStartDT, todayEndDT);
        Long lastMonthUsers = userRepository.countUsersInRange(lastMonthStartDT, lastMonthEndDT);
        if (thisMonthUsers == null) thisMonthUsers = 0L;
        if (lastMonthUsers == null) lastMonthUsers = 0L;

        double emissionChange = lastMonthEmissions.compareTo(BigDecimal.ZERO) == 0 ? 0 :
            thisMonthEmissions.subtract(lastMonthEmissions)
                .divide(lastMonthEmissions, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();

        double activityChange = lastMonthActivities == 0 ? 0 :
            ((double)(thisMonthActivities - lastMonthActivities) / lastMonthActivities) * 100;

        double userChange = lastMonthUsers == 0 ? 0 :
            ((double)(thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("thisMonthEmissions", thisMonthEmissions);
        result.put("lastMonthEmissions", lastMonthEmissions);
        result.put("emissionChangePercent", Math.round(emissionChange * 100.0) / 100.0);
        result.put("thisMonthActivities", thisMonthActivities);
        result.put("lastMonthActivities", lastMonthActivities);
        result.put("activityChangePercent", Math.round(activityChange * 100.0) / 100.0);
        result.put("thisMonthUsers", thisMonthUsers);
        result.put("lastMonthUsers", lastMonthUsers);
        result.put("userChangePercent", Math.round(userChange * 100.0) / 100.0);
        return result;
    }

    // ─────────────────────────────────────────────────────────────
    // DAILY PLATFORM ANALYTICS
    // ─────────────────────────────────────────────────────────────

    public DailyAnalyticsResponse getDailyAnalytics() {
        log.info("Fetching Daily Platform Analytics");
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay   = LocalDate.now().atTime(23, 59, 59);

        // ─── KPIs ─────────────────────────────────────────────────
        Long activitiesToday  = activityLogRepository.countActivitiesToday(startOfDay, endOfDay);
        BigDecimal emissions  = activityLogRepository.sumEmissionsToday(startOfDay, endOfDay);
        Long activeUsers      = activityLogRepository.countActiveUsersToday(startOfDay, endOfDay);
        Long newUsers         = userRepository.countUsersInRange(startOfDay, endOfDay);
        Long goalsAchieved    = goalRepository.countByStatusAndUpdatedAtBetween(
                GoalStatus.ACHIEVED, startOfDay, endOfDay);
        Long badgesEarned     = userBadgeRepository.countBadgesEarnedToday(startOfDay, endOfDay);

        if (activitiesToday == null) activitiesToday = 0L;
        if (emissions       == null) emissions       = BigDecimal.ZERO;
        if (activeUsers     == null) activeUsers     = 0L;
        if (newUsers        == null) newUsers        = 0L;
        if (goalsAchieved   == null) goalsAchieved   = 0L;
        if (badgesEarned    == null) badgesEarned    = 0L;

        // ─── Hourly Breakdown ──────────────────────────────────────
        List<Object[]> hourlyRaw = activityLogRepository.getHourlyBreakdown(startOfDay, endOfDay);
        Map<Integer, Object[]> hourMap = new HashMap<>();
        for (Object[] row : hourlyRaw) {
            int hour = ((Number) row[0]).intValue();
            hourMap.put(hour, row);
        }

        List<DailyAnalyticsResponse.HourlySlot> hourlyData = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            Object[] row = hourMap.get(h);
            long acts          = row != null ? ((Number) row[1]).longValue()  : 0L;
            BigDecimal ems     = row != null ? (BigDecimal) row[2]            : BigDecimal.ZERO;
            long users         = row != null ? ((Number) row[3]).longValue()  : 0L;
            if (ems == null) ems = BigDecimal.ZERO;

            String label;
            if (h == 0)       label = "12 AM";
            else if (h < 12)  label = h + " AM";
            else if (h == 12) label = "12 PM";
            else              label = (h - 12) + " PM";

            hourlyData.add(DailyAnalyticsResponse.HourlySlot.builder()
                    .hour(h)
                    .label(label)
                    .activities(acts)
                    .emissions(ems)
                    .activeUsers(users)
                    .build());
        }

        return DailyAnalyticsResponse.builder()
                .activitiesToday(activitiesToday)
                .emissionsToday(emissions)
                .activeUsersToday(activeUsers)
                .newUsersToday(newUsers)
                .goalsAchievedToday(goalsAchieved)
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // WEEKLY PLATFORM ANALYTICS
    // ─────────────────────────────────────────────────────────────

    public WeeklyAnalyticsResponse getWeeklyAnalytics() {
        log.info("Fetching Weekly Platform Analytics");
        
        LocalDate today = LocalDate.now();
        // Calculate current week (Monday to Sunday)
        int dayOfWeekVal = today.getDayOfWeek().getValue(); // 1 = Monday, 7 = Sunday
        LocalDate startOfWeekDate = today.minusDays(dayOfWeekVal - 1);
        LocalDate endOfWeekDate = startOfWeekDate.plusDays(6);
        LocalDateTime startOfWeek = startOfWeekDate.atStartOfDay();
        LocalDateTime endOfWeek = endOfWeekDate.atTime(23, 59, 59);

        // Previous week
        LocalDateTime startOfPrevWeek = startOfWeek.minusWeeks(1);
        LocalDateTime endOfPrevWeek = endOfWeek.minusWeeks(1);

        // Current Week Totals
        Long curActivities = activityLogRepository.countActivitiesToday(startOfWeek, endOfWeek);
        Long curUsers = activityLogRepository.countActiveUsersToday(startOfWeek, endOfWeek);
        BigDecimal curEmissions = activityLogRepository.sumEmissionsToday(startOfWeek, endOfWeek);
        Long curGoals = goalRepository.countByStatusAndUpdatedAtBetween(GoalStatus.ACHIEVED, startOfWeek, endOfWeek);

        if (curActivities == null) curActivities = 0L;
        if (curUsers == null) curUsers = 0L;
        if (curEmissions == null) curEmissions = BigDecimal.ZERO;
        if (curGoals == null) curGoals = 0L;

        // Previous Week Totals
        Long prevActivities = activityLogRepository.countActivitiesToday(startOfPrevWeek, endOfPrevWeek);
        Long prevUsers = activityLogRepository.countActiveUsersToday(startOfPrevWeek, endOfPrevWeek);
        BigDecimal prevEmissions = activityLogRepository.sumEmissionsToday(startOfPrevWeek, endOfPrevWeek);
        Long prevGoals = goalRepository.countByStatusAndUpdatedAtBetween(GoalStatus.ACHIEVED, startOfPrevWeek, endOfPrevWeek);

        if (prevActivities == null) prevActivities = 0L;
        if (prevUsers == null) prevUsers = 0L;
        if (prevEmissions == null) prevEmissions = BigDecimal.ZERO;
        if (prevGoals == null) prevGoals = 0L;

        // Calculate % Changes
        double actChange = prevActivities == 0 ? (curActivities > 0 ? 100.0 : 0.0) : ((double)(curActivities - prevActivities) / prevActivities) * 100.0;
        double usrChange = prevUsers == 0 ? (curUsers > 0 ? 100.0 : 0.0) : ((double)(curUsers - prevUsers) / prevUsers) * 100.0;
        double emsChange = prevEmissions.compareTo(BigDecimal.ZERO) == 0 ? (curEmissions.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0) : curEmissions.subtract(prevEmissions).divide(prevEmissions, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).doubleValue();
        double goalChange = prevGoals == 0 ? (curGoals > 0 ? 100.0 : 0.0) : ((double)(curGoals - prevGoals) / prevGoals) * 100.0;

        // Daily Breakdown (Mon-Sun)
        List<Object[]> weeklyRaw = activityLogRepository.getWeeklyBreakdown(startOfWeek, endOfWeek);
        List<Object[]> weeklyGoalsRaw = goalRepository.getWeeklyGoalBreakdown(GoalStatus.ACHIEVED, startOfWeek, endOfWeek);

        Map<java.sql.Date, Object[]> dayMap = new HashMap<>();
        for (Object[] row : weeklyRaw) {
            dayMap.put((java.sql.Date) row[0], row);
        }
        
        Map<java.sql.Date, Long> goalDayMap = new HashMap<>();
        for (Object[] row : weeklyGoalsRaw) {
            goalDayMap.put((java.sql.Date) row[0], ((Number) row[1]).longValue());
        }

        List<WeeklyAnalyticsResponse.DailySlot> weeklyData = new ArrayList<>();
        java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("MMM dd");

        for (int i = 0; i < 7; i++) {
            LocalDate d = startOfWeekDate.plusDays(i);
            java.sql.Date sqlDate = java.sql.Date.valueOf(d);
            
            Object[] row = dayMap.get(sqlDate);
            long acts          = row != null ? ((Number) row[1]).longValue()  : 0L;
            BigDecimal ems     = row != null ? (BigDecimal) row[2]            : BigDecimal.ZERO;
            long users         = row != null ? ((Number) row[3]).longValue()  : 0L;
            if (ems == null) ems = BigDecimal.ZERO;
            
            long goals = goalDayMap.getOrDefault(sqlDate, 0L);
            
            String dayOfWeekName = d.getDayOfWeek().name();
            dayOfWeekName = dayOfWeekName.substring(0, 1) + dayOfWeekName.substring(1).toLowerCase();

            weeklyData.add(WeeklyAnalyticsResponse.DailySlot.builder()
                    .dayOfWeek(dayOfWeekName)
                    .dateLabel(d.format(fmt))
                    .activities(acts)
                    .activeUsers(users)
                    .emissions(ems)
                    .goalsAchieved(goals)
                    .build());
        }

        return WeeklyAnalyticsResponse.builder()
                .totalActivities(curActivities)
                .totalUsers(curUsers)
                .totalEmissions(curEmissions)
                .totalGoals(curGoals)
                .activitiesChangePct(Math.round(actChange * 100.0) / 100.0)
                .usersChangePct(Math.round(usrChange * 100.0) / 100.0)
                .emissionsChangePct(Math.round(emsChange * 100.0) / 100.0)
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // MONTHLY PLATFORM ANALYTICS
    // ─────────────────────────────────────────────────────────────

    public MonthlyAnalyticsResponse getMonthlyAnalytics() {
        log.info("Fetching Monthly Platform Analytics");
        
        LocalDate today = LocalDate.now();
        // Current Month
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = today.withDayOfMonth(today.lengthOfMonth()).atTime(23, 59, 59);

        // Previous Month
        LocalDate prevMonthDate = today.minusMonths(1);
        LocalDateTime startOfPrevMonth = prevMonthDate.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfPrevMonth = prevMonthDate.withDayOfMonth(prevMonthDate.lengthOfMonth()).atTime(23, 59, 59);

        // Current Month Totals
        Long curActivities = activityLogRepository.countActivitiesToday(startOfMonth, endOfMonth);
        Long curUsers = activityLogRepository.countActiveUsersToday(startOfMonth, endOfMonth);
        BigDecimal curEmissions = activityLogRepository.sumEmissionsToday(startOfMonth, endOfMonth);
        Long curGoals = goalRepository.countByStatusAndUpdatedAtBetween(GoalStatus.ACHIEVED, startOfMonth, endOfMonth);

        if (curActivities == null) curActivities = 0L;
        if (curUsers == null) curUsers = 0L;
        if (curEmissions == null) curEmissions = BigDecimal.ZERO;
        if (curGoals == null) curGoals = 0L;

        // Previous Month Totals
        Long prevActivities = activityLogRepository.countActivitiesToday(startOfPrevMonth, endOfPrevMonth);
        Long prevUsers = activityLogRepository.countActiveUsersToday(startOfPrevMonth, endOfPrevMonth);
        BigDecimal prevEmissions = activityLogRepository.sumEmissionsToday(startOfPrevMonth, endOfPrevMonth);
        Long prevGoals = goalRepository.countByStatusAndUpdatedAtBetween(GoalStatus.ACHIEVED, startOfPrevMonth, endOfPrevMonth);

        if (prevActivities == null) prevActivities = 0L;
        if (prevUsers == null) prevUsers = 0L;
        if (prevEmissions == null) prevEmissions = BigDecimal.ZERO;
        if (prevGoals == null) prevGoals = 0L;

        // Calculate % Changes
        double actChange = prevActivities == 0 ? (curActivities > 0 ? 100.0 : 0.0) : ((double)(curActivities - prevActivities) / prevActivities) * 100.0;
        double usrChange = prevUsers == 0 ? (curUsers > 0 ? 100.0 : 0.0) : ((double)(curUsers - prevUsers) / prevUsers) * 100.0;
        double emsChange = prevEmissions.compareTo(BigDecimal.ZERO) == 0 ? (curEmissions.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0) : curEmissions.subtract(prevEmissions).divide(prevEmissions, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).doubleValue();
        double goalChange = prevGoals == 0 ? (curGoals > 0 ? 100.0 : 0.0) : ((double)(curGoals - prevGoals) / prevGoals) * 100.0;

        // Category Distribution
        List<Object[]> catRaw = activityLogRepository.sumEmissionsByCategoryAndDateRangeGlobal(startOfMonth, endOfMonth);
        List<MonthlyAnalyticsResponse.CategorySlot> catData = new ArrayList<>();
        for (Object[] row : catRaw) {
            String cat = (String) row[0];
            BigDecimal val = (BigDecimal) row[1];
            catData.add(MonthlyAnalyticsResponse.CategorySlot.builder().category(cat).emissions(val != null ? val : BigDecimal.ZERO).build());
        }

        // Weekly Breakdown (Week 1 - 5)
        // We reuse the getWeeklyBreakdown method which just groups by DATE
        List<Object[]> dailyRaw = activityLogRepository.getWeeklyBreakdown(startOfMonth, endOfMonth);
        List<Object[]> dailyGoalsRaw = goalRepository.getWeeklyGoalBreakdown(GoalStatus.ACHIEVED, startOfMonth, endOfMonth);

        Map<java.sql.Date, Object[]> dayMap = new HashMap<>();
        for (Object[] row : dailyRaw) { dayMap.put((java.sql.Date) row[0], row); }
        
        Map<java.sql.Date, Long> goalDayMap = new HashMap<>();
        for (Object[] row : dailyGoalsRaw) { goalDayMap.put((java.sql.Date) row[0], ((Number) row[1]).longValue()); }

        List<MonthlyAnalyticsResponse.WeeklySlot> weeklyData = new ArrayList<>();
        for (int week = 1; week <= 5; week++) {
            long wActs = 0L;
            long wUsers = 0L; // approximate sum over days (not distinct per week, but good enough for trend)
            BigDecimal wEms = BigDecimal.ZERO;
            long wGoals = 0L;
            boolean hasDays = false;
            
            for (int d = 1; d <= 7; d++) {
                int dayOfMonth = ((week - 1) * 7) + d;
                if (dayOfMonth > today.lengthOfMonth()) break;
                
                LocalDate date = startOfMonth.toLocalDate().plusDays(dayOfMonth - 1);
                java.sql.Date sqlDate = java.sql.Date.valueOf(date);
                hasDays = true;
                
                Object[] row = dayMap.get(sqlDate);
                if (row != null) {
                    wActs += ((Number) row[1]).longValue();
                    wEms = wEms.add(row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO);
                    wUsers += ((Number) row[3]).longValue();
                }
                wGoals += goalDayMap.getOrDefault(sqlDate, 0L);
            }
            
            if (hasDays) {
                weeklyData.add(MonthlyAnalyticsResponse.WeeklySlot.builder()
                        .weekLabel("Week " + week)
                        .activities(wActs)
                        .activeUsers(wUsers)
                        .emissions(wEms)
                        .goalsAchieved(wGoals)
                        .build());
            }
        }

        return MonthlyAnalyticsResponse.builder()
                .totalActivities(curActivities)
                .totalUsers(curUsers)
                .totalEmissions(curEmissions)
                .totalGoals(curGoals)
                .activitiesChangePct(Math.round(actChange * 100.0) / 100.0)
                .usersChangePct(Math.round(usrChange * 100.0) / 100.0)
                .emissionsChangePct(Math.round(emsChange * 100.0) / 100.0)
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // YEARLY PLATFORM ANALYTICS
    // ─────────────────────────────────────────────────────────────

    public YearlyAnalyticsResponse getYearlyAnalytics() {
        log.info("Fetching Yearly Platform Analytics");
        
        LocalDate today = LocalDate.now();
        
        // Current Year
        LocalDateTime startOfYear = today.withDayOfYear(1).atStartOfDay();
        LocalDateTime endOfYear = today.withDayOfYear(today.lengthOfYear()).atTime(23, 59, 59);

        // Previous Year
        LocalDate prevYearDate = today.minusYears(1);
        LocalDateTime startOfPrevYear = prevYearDate.withDayOfYear(1).atStartOfDay();
        LocalDateTime endOfPrevYear = prevYearDate.withDayOfYear(prevYearDate.lengthOfYear()).atTime(23, 59, 59);

        // Current Year Totals
        Long curActivities = activityLogRepository.countActivitiesToday(startOfYear, endOfYear);
        Long curUsers = activityLogRepository.countActiveUsersToday(startOfYear, endOfYear);
        BigDecimal curEmissions = activityLogRepository.sumEmissionsToday(startOfYear, endOfYear);
        Long curGoals = goalRepository.countByStatusAndUpdatedAtBetween(GoalStatus.ACHIEVED, startOfYear, endOfYear);
        Long curBadges = userBadgeRepository.countBadgesEarnedToday(startOfYear, endOfYear);

        if (curActivities == null) curActivities = 0L;
        if (curUsers == null) curUsers = 0L;
        if (curEmissions == null) curEmissions = BigDecimal.ZERO;
        if (curGoals == null) curGoals = 0L;
        if (curBadges == null) curBadges = 0L;

        // Previous Year Totals
        Long prevActivities = activityLogRepository.countActivitiesToday(startOfPrevYear, endOfPrevYear);
        Long prevUsers = activityLogRepository.countActiveUsersToday(startOfPrevYear, endOfPrevYear);
        BigDecimal prevEmissions = activityLogRepository.sumEmissionsToday(startOfPrevYear, endOfPrevYear);
        Long prevGoals = goalRepository.countByStatusAndUpdatedAtBetween(GoalStatus.ACHIEVED, startOfPrevYear, endOfPrevYear);
        Long prevBadges = userBadgeRepository.countBadgesEarnedToday(startOfPrevYear, endOfPrevYear);

        if (prevActivities == null) prevActivities = 0L;
        if (prevUsers == null) prevUsers = 0L;
        if (prevEmissions == null) prevEmissions = BigDecimal.ZERO;
        if (prevGoals == null) prevGoals = 0L;
        if (prevBadges == null) prevBadges = 0L;

        // Calculate % Changes
        double actChange = prevActivities == 0 ? (curActivities > 0 ? 100.0 : 0.0) : ((double)(curActivities - prevActivities) / prevActivities) * 100.0;
        double usrChange = prevUsers == 0 ? (curUsers > 0 ? 100.0 : 0.0) : ((double)(curUsers - prevUsers) / prevUsers) * 100.0;
        double emsChange = prevEmissions.compareTo(BigDecimal.ZERO) == 0 ? (curEmissions.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0) : curEmissions.subtract(prevEmissions).divide(prevEmissions, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).doubleValue();
        double goalChange = prevGoals == 0 ? (curGoals > 0 ? 100.0 : 0.0) : ((double)(curGoals - prevGoals) / prevGoals) * 100.0;
        double badChange = prevBadges == 0 ? (curBadges > 0 ? 100.0 : 0.0) : ((double)(curBadges - prevBadges) / prevBadges) * 100.0;

        // Daily breakdowns for aggregation
        List<Object[]> dailyRaw = activityLogRepository.getWeeklyBreakdown(startOfYear, endOfYear);
        List<Object[]> dailyGoalsRaw = goalRepository.getWeeklyGoalBreakdown(GoalStatus.ACHIEVED, startOfYear, endOfYear);
        List<Object[]> dailyBadgesRaw = userBadgeRepository.getDailyBadgeBreakdown(startOfYear, endOfYear);

        Map<java.sql.Date, Object[]> dayMap = new HashMap<>();
        for (Object[] row : dailyRaw) { dayMap.put((java.sql.Date) row[0], row); }
        
        Map<java.sql.Date, Long> goalDayMap = new HashMap<>();
        for (Object[] row : dailyGoalsRaw) { goalDayMap.put((java.sql.Date) row[0], ((Number) row[1]).longValue()); }

        Map<java.sql.Date, Long> badgeDayMap = new HashMap<>();
        for (Object[] row : dailyBadgesRaw) { badgeDayMap.put((java.sql.Date) row[0], ((Number) row[1]).longValue()); }

        String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        List<YearlyAnalyticsResponse.MonthlySlot> monthlyData = new ArrayList<>();

        for (int m = 1; m <= 12; m++) {
            long mActs = 0L;
            long mUsers = 0L; // Approximate unique users (sum of daily actives)
            BigDecimal mEms = BigDecimal.ZERO;
            long mGoals = 0L;
            long mBadges = 0L;
            
            LocalDate startOfM = today.withMonth(m).withDayOfMonth(1);
            int daysInM = startOfM.lengthOfMonth();
            
            for (int d = 1; d <= daysInM; d++) {
                LocalDate date = startOfM.withDayOfMonth(d);
                if (date.isAfter(today)) break; // Don't include future days in current year
                
                java.sql.Date sqlDate = java.sql.Date.valueOf(date);
                
                Object[] row = dayMap.get(sqlDate);
                if (row != null) {
                    mActs += ((Number) row[1]).longValue();
                    mEms = mEms.add(row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO);
                    mUsers += ((Number) row[3]).longValue(); // Approximate for trend
                }
                mGoals += goalDayMap.getOrDefault(sqlDate, 0L);
                mBadges += badgeDayMap.getOrDefault(sqlDate, 0L);
            }
            
            monthlyData.add(YearlyAnalyticsResponse.MonthlySlot.builder()
                    .monthLabel(monthNames[m-1])
                    .activities(mActs)
                    .activeUsers(mUsers)
                    .emissions(mEms)
                    .goalsAchieved(mGoals)
                    .badgesEarned(mBadges)
                    .organizationsJoined(0L) // Mocking organizations since not yet implemented
                    .build());
        }

        return YearlyAnalyticsResponse.builder()
                .totalActivities(curActivities)
                .totalUsers(curUsers)
                .totalEmissions(curEmissions)
                .totalGoals(curGoals)
                .totalBadges(curBadges)
                .totalOrganizations(0L)
                .activitiesChangePct(Math.round(actChange * 100.0) / 100.0)
                .usersChangePct(Math.round(usrChange * 100.0) / 100.0)
                .emissionsChangePct(Math.round(emsChange * 100.0) / 100.0)
                .goalsChangePct(Math.round(goalChange * 100.0) / 100.0)
                .badgesChangePct(Math.round(badChange * 100.0) / 100.0)
                .organizationsChangePct(0.0)
                .monthlyData(monthlyData)
                .build();
    }
}
