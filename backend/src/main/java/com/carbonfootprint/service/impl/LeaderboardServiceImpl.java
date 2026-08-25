package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.leaderboard.LeaderboardEntryDto;
import com.carbonfootprint.dto.leaderboard.LeaderboardResponseDto;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.event.UserMetricsUpdatedEvent;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.GoalRepository;
import com.carbonfootprint.repository.UserBadgeRepository;
import com.carbonfootprint.repository.UserChallengeRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.repository.WeeklyLeaderboardHistoryRepository;
import com.carbonfootprint.repository.MonthlyLeaderboardHistoryRepository;
import com.carbonfootprint.repository.YearlyLeaderboardHistoryRepository;
import com.carbonfootprint.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaderboardServiceImpl implements LeaderboardService {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final GoalRepository goalRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserChallengeRepository userChallengeRepository;
    private final WeeklyLeaderboardHistoryRepository weeklyLeaderboardHistoryRepository;
    private final MonthlyLeaderboardHistoryRepository monthlyLeaderboardHistoryRepository;
    private final YearlyLeaderboardHistoryRepository yearlyLeaderboardHistoryRepository;
    private final com.carbonfootprint.service.ScoringEngineService scoringEngineService;
    private final ApplicationEventPublisher eventPublisher;

    private static final String LEADERBOARD_CACHE = "leaderboardCache";

    @Override
    @Cacheable(value = LEADERBOARD_CACHE, key = "'global_' + (#category != null ? #category : 'all') + '_' + (#sortBy != null ? #sortBy : 'score')")
    public LeaderboardResponseDto getLeaderboard(String currentUserEmail, String category, String sortBy) {
        log.info("Calculating comprehensive leaderboard dynamically...");
        List<User> allUsers = userRepository.findAll();
        
        // 1. Fetch grouped stats
        Map<Long, Long> activityCounts;
        Map<Long, Long> activeWeeks;
        if (category != null && !category.equalsIgnoreCase("Overall")) {
            activityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndCategory(category));
            activeWeeks = extractCounts(activityLogRepository.countActiveWeeksGroupedByUserAndCategory(category));
        } else {
            activityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUser());
            activeWeeks = extractCounts(activityLogRepository.countActiveWeeksGroupedByUser());
        }
        Map<Long, Long> completedGoals = extractCounts(goalRepository.countCompletedGoalsGroupedByUser());
        Map<Long, Long> badgeCounts = extractCounts(userBadgeRepository.countBadgesGroupedByUser());
        Map<Long, Long> challengeCounts = extractCounts(userChallengeRepository.countChallengesGroupedByUser());

        List<LeaderboardEntryDto> entries = new ArrayList<>();

        for (User user : allUsers) {
            Long userId = user.getId();
            
            long acts = activityCounts.getOrDefault(userId, 0L);
            long weeks = activeWeeks.getOrDefault(userId, 0L);
            long goals = completedGoals.getOrDefault(userId, 0L);
            long badges = badgeCounts.getOrDefault(userId, 0L);
            
            // We use 0 for carbonSaved and prev acts for the global one as placeholders, or we could fetch them.
            // Since global doesn't have an easy "previous period", we just pass 0.
            Map<String, Long> scores = scoringEngineService.calculateSustainabilityScore(
                    user, null, null);

            entries.add(LeaderboardEntryDto.builder()
                    .userId(userId)
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .username(user.getUsername())
                    .profilePictureUrl(user.getProfilePictureUrl())
                    .participationScore(scores.get("participationScore"))
                    .goalScore(scores.get("goalScore"))
                    .badgeScore(scores.get("badgeScore"))
                    .carbonReductionScore(scores.get("carbonReductionScore"))
                    .consistencyScore(scores.get("consistencyScore"))
                    .improvementScore(scores.get("improvementScore"))
                    .totalSustainabilityScore(scores.get("totalScore"))
                    .build());
        }

        // Sort descending
        if ("Most Goals Completed".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Long.compare(b.getGoalScore() != null ? b.getGoalScore() : 0L, a.getGoalScore() != null ? a.getGoalScore() : 0L));
        } else if ("Most Improved".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Long.compare(b.getImprovementScore() != null ? b.getImprovementScore() : 0L, a.getImprovementScore() != null ? a.getImprovementScore() : 0L));
        } else {
            entries.sort((a, b) -> Long.compare(b.getTotalSustainabilityScore() != null ? b.getTotalSustainabilityScore() : 0L, a.getTotalSustainabilityScore() != null ? a.getTotalSustainabilityScore() : 0L));
        }

        // Assign ranks and find current user
        LeaderboardEntryDto currentUserEntry = null;
        for (int i = 0; i < entries.size(); i++) {
            LeaderboardEntryDto entry = entries.get(i);
            entry.setRank(i + 1);
            if (currentUserEmail != null && userRepository.findByEmail(currentUserEmail).isPresent() &&
                entry.getUserId().equals(userRepository.findByEmail(currentUserEmail).get().getId())) {
                currentUserEntry = entry;
            }
        }

        // Return top 50 globally
        List<LeaderboardEntryDto> topUsers = entries.stream().limit(50).collect(Collectors.toList());

        return LeaderboardResponseDto.builder()
                .topUsers(topUsers)
                .currentUser(currentUserEntry)
                .totalUsers(entries.size())
                .build();
    }

    @Override
    @CacheEvict(value = LEADERBOARD_CACHE, allEntries = true)
    public void evictLeaderboardCache() {
        log.info("Evicting leaderboard cache.");
    }

    // Schedule eviction every hour to keep data fresh but performant
    @Scheduled(fixedRate = 3600000)
    public void scheduledCacheEviction() {
        evictLeaderboardCache();
    }
    
    @Scheduled(cron = "0 59 23 * * SUN") // Every Sunday at 23:59 Server Time
    public void snapshotWeeklyLeaderboard() {
        log.info("Snapshotting weekly leaderboard to history...");
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1); // Monday
        java.time.LocalDate weekEnd = today;

        com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardResponseDto weekly = getWeeklyLeaderboard(null, weekStart, weekEnd, null, null);
        
        List<com.carbonfootprint.entity.WeeklyLeaderboardHistory> histories = new ArrayList<>();
        for (com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardEntryDto dto : weekly.getTopUsers()) {
            User user = userRepository.findById(dto.getUserId()).orElse(null);
            if (user != null) {
                com.carbonfootprint.entity.WeeklyLeaderboardHistory h = com.carbonfootprint.entity.WeeklyLeaderboardHistory.builder()
                        .user(user)
                        .weekStartDate(weekStart)
                        .weekEndDate(weekEnd)
                        .rank(dto.getRank())
                        .weeklyScore(dto.getWeeklyScore())
                        .carbonSaved(dto.getCarbonSaved())
                        .badgesEarned(dto.getBadgesEarned())
                        .trend(dto.getTrend())
                        .build();
                histories.add(h);
            }
        }
        weeklyLeaderboardHistoryRepository.saveAll(histories);
        log.info("Saved {} users to weekly leaderboard history.", histories.size());

        // Publish event for top 100 users so rules engine can process Leaderboard Rank badges
        histories.stream().limit(100).forEach(h -> {
            eventPublisher.publishEvent(new UserMetricsUpdatedEvent(this, h.getUser().getId()));
        });
    }

    @Override
    @Cacheable(value = LEADERBOARD_CACHE, key = "'weekly_' + #weekStart + '_' + #weekEnd + '_' + (#category != null ? #category : 'all') + '_' + (#sortBy != null ? #sortBy : 'score')")
    public com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardResponseDto getWeeklyLeaderboard(String currentUserEmail, java.time.LocalDate weekStart, java.time.LocalDate weekEnd, String category, String sortBy) {
        log.info("Calculating weekly leaderboard dynamically for range {} - {}", weekStart, weekEnd);
        List<User> allUsers = userRepository.findAll();
        
        java.time.LocalDateTime startDateTime = weekStart.atStartOfDay();
        java.time.LocalDateTime endDateTime = weekEnd.atTime(23, 59, 59);

        // Fetch grouped stats for date range
        Map<Long, Long> activityCounts;
        Map<Long, java.math.BigDecimal> userEmissions;
        if (category != null && !category.equalsIgnoreCase("Overall")) {
            activityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndDateRangeAndCategory(weekStart, weekEnd, category));
            userEmissions = extractEmissions(activityLogRepository.sumEmissionsGroupedByUserAndDateRangeAndCategory(weekStart, weekEnd, category));
        } else {
            activityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndDateRange(weekStart, weekEnd));
            userEmissions = extractEmissions(activityLogRepository.sumEmissionsGroupedByUserAndDateRange(weekStart, weekEnd));
        }
        Map<Long, Long> completedGoals = extractCounts(goalRepository.countCompletedGoalsGroupedByUserAndDateRange(startDateTime, endDateTime));
        Map<Long, Long> badgeCounts = extractCounts(userBadgeRepository.countBadgesGroupedByUserAndDateRange(startDateTime, endDateTime));

        List<com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardEntryDto> entries = new ArrayList<>();

        for (User user : allUsers) {
            Long userId = user.getId();
            
            long acts = activityCounts.getOrDefault(userId, 0L);
            long goals = completedGoals.getOrDefault(userId, 0L);
            long badges = badgeCounts.getOrDefault(userId, 0L);
            java.math.BigDecimal emissions = userEmissions.getOrDefault(userId, java.math.BigDecimal.ZERO);
            
            Map<String, Long> scores = scoringEngineService.calculateSustainabilityScore(
                    user, startDateTime, endDateTime);
            
            String trend = "STABLE";
            if (acts > 5) trend = "UP";
            else if (acts > 0 && acts <= 2) trend = "DOWN";

            entries.add(com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardEntryDto.builder()
                    .userId(userId)
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .username(user.getUsername())
                    .profilePictureUrl(user.getProfilePictureUrl())
                    .weeklyScore(scores.get("totalScore"))
                    .carbonSaved(emissions)
                    .badgesEarned((int)badges)
                    .trend(trend)
                    .participationScore(scores.get("participationScore"))
                    .goalScore(scores.get("goalScore"))
                    .badgeScore(scores.get("badgeScore"))
                    .carbonReductionScore(scores.get("carbonReductionScore"))
                    .consistencyScore(scores.get("consistencyScore"))
                    .improvementScore(scores.get("improvementScore"))
                    .build());
        }

        // Sort descending
        if ("Most Goals Completed".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Long.compare(b.getGoalScore() != null ? b.getGoalScore() : 0L, a.getGoalScore() != null ? a.getGoalScore() : 0L));
        } else if ("Most Improved".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Long.compare(b.getImprovementScore() != null ? b.getImprovementScore() : 0L, a.getImprovementScore() != null ? a.getImprovementScore() : 0L));
        } else {
            entries.sort((a, b) -> Long.compare(b.getWeeklyScore() != null ? b.getWeeklyScore() : 0L, a.getWeeklyScore() != null ? a.getWeeklyScore() : 0L));
        }

        com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardEntryDto currentUserEntry = null;
        for (int i = 0; i < entries.size(); i++) {
            com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardEntryDto entry = entries.get(i);
            entry.setRank(i + 1);
            if (currentUserEmail != null && userRepository.findByEmail(currentUserEmail).isPresent() &&
                entry.getUserId().equals(userRepository.findByEmail(currentUserEmail).get().getId())) {
                currentUserEntry = entry;
            }
        }

        List<com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardEntryDto> topUsers = entries.stream().limit(100).collect(Collectors.toList());

        return com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardResponseDto.builder()
                .topUsers(topUsers)
                .currentUser(currentUserEntry)
                .totalUsers(entries.size())
                .weekStartDate(weekStart)
                .weekEndDate(weekEnd)
                .build();
    }

    @Override
    public java.util.List<com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardEntryDto> getWeeklyLeaderboardHistory(java.time.LocalDate weekStart, java.time.LocalDate weekEnd) {
        List<com.carbonfootprint.entity.WeeklyLeaderboardHistory> histories = weeklyLeaderboardHistoryRepository.findByWeekStartDateAndWeekEndDateOrderByRankAsc(weekStart, weekEnd);
        return histories.stream().map(h -> com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardEntryDto.builder()
                .userId(h.getUser().getId())
                .firstName(h.getUser().getFirstName())
                .lastName(h.getUser().getLastName())
                .username(h.getUser().getUsername())
                .rank(h.getRank())
                .weeklyScore(h.getWeeklyScore())
                .carbonSaved(h.getCarbonSaved())
                .badgesEarned(h.getBadgesEarned())
                .trend(h.getTrend())
                .build()).collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = LEADERBOARD_CACHE, key = "'monthly_' + #monthStart + '_' + #monthEnd + '_' + (#category != null ? #category : 'all') + '_' + (#sortBy != null ? #sortBy : 'score')")
    public com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardResponseDto getMonthlyLeaderboard(String currentUserEmail, java.time.LocalDate monthStart, java.time.LocalDate monthEnd, String category, String sortBy) {
        log.info("Calculating monthly leaderboard dynamically for range {} - {}", monthStart, monthEnd);
        List<User> allUsers = userRepository.findAll();
        
        java.time.LocalDateTime startDateTime = monthStart.atStartOfDay();
        java.time.LocalDateTime endDateTime = monthEnd.atTime(23, 59, 59);

        // Fetch grouped stats for date range
        Map<Long, Long> activityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndDateRange(monthStart, monthEnd));
        Map<Long, Long> completedGoals = extractCounts(goalRepository.countCompletedGoalsGroupedByUserAndDateRange(startDateTime, endDateTime));
        Map<Long, Long> badgeCounts = extractCounts(userBadgeRepository.countBadgesGroupedByUserAndDateRange(startDateTime, endDateTime));
        
        // Fetch carbon reductions (emissions this month)
        Map<Long, java.math.BigDecimal> userEmissions = extractEmissions(activityLogRepository.sumEmissionsGroupedByUserAndDateRange(monthStart, monthEnd));

        // For "Top Improver", we will mock the previous month activity calculation to avoid huge performance hit here,
        // or just calculate "activity consistency" ratio (recent 15 days vs first 15 days)
        java.time.LocalDate midMonth = monthStart.plusDays(15);
        Map<Long, Long> recentActivityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndDateRange(midMonth, monthEnd));

        List<com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardEntryDto> entries = new ArrayList<>();

        for (User user : allUsers) {
            Long userId = user.getId();
            
            long acts = activityCounts.getOrDefault(userId, 0L);
            long goals = completedGoals.getOrDefault(userId, 0L);
            long badges = badgeCounts.getOrDefault(userId, 0L);
            long recentActs = recentActivityCounts.getOrDefault(userId, 0L);
            java.math.BigDecimal emissions = userEmissions.getOrDefault(userId, java.math.BigDecimal.ZERO);
            
            // Determine active weeks approximately
            long activeWeeks = acts > 0 ? (acts > 10 ? 4 : acts / 3 + 1) : 0;
            long previousPeriodActs = acts > 0 ? (acts - recentActs) : 0;

            Map<String, Long> scores = scoringEngineService.calculateSustainabilityScore(
                    user, startDateTime, endDateTime);

            List<String> awards = new ArrayList<>();
            // We will assign dynamic awards later after sorting

            entries.add(com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardEntryDto.builder()
                    .userId(userId)
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .username(user.getUsername())
                    .profilePictureUrl(user.getProfilePictureUrl())
                    .monthlyScore(scores.get("totalScore"))
                    .carbonSaved(emissions)
                    .goalsCompleted((int)goals)
                    .activityCount((int)acts)
                    .badgesEarned((int)badges)
                    .awards(awards)
                    .participationScore(scores.get("participationScore"))
                    .goalScore(scores.get("goalScore"))
                    .badgeScore(scores.get("badgeScore"))
                    .carbonReductionScore(scores.get("carbonReductionScore"))
                    .consistencyScore(scores.get("consistencyScore"))
                    .improvementScore(scores.get("improvementScore"))
                    .build());
        }

        // Sort descending
        if ("Most Goals Completed".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Integer.compare(b.getGoalsCompleted() != null ? b.getGoalsCompleted() : 0, a.getGoalsCompleted() != null ? a.getGoalsCompleted() : 0));
        } else if ("Most Improved".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Long.compare(b.getImprovementScore() != null ? b.getImprovementScore() : 0L, a.getImprovementScore() != null ? a.getImprovementScore() : 0L));
        } else {
            entries.sort((a, b) -> Long.compare(b.getMonthlyScore() != null ? b.getMonthlyScore() : 0L, a.getMonthlyScore() != null ? a.getMonthlyScore() : 0L));
        }

        // Assign Ranks and calculate Awards
        Long maxActivities = 0L;
        Long maxGoals = 0L;
        Long maxImproverScore = 0L;
        
        for (int i = 0; i < entries.size(); i++) {
            com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardEntryDto entry = entries.get(i);
            entry.setRank(i + 1);
            
            if (entry.getActivityCount() > maxActivities) maxActivities = (long) entry.getActivityCount();
            if (entry.getGoalsCompleted() > maxGoals) maxGoals = (long) entry.getGoalsCompleted();
            
            // Improver score mock (recent acts vs overall)
            long improverScore = entry.getActivityCount() > 0 ? recentActivityCounts.getOrDefault(entry.getUserId(), 0L) * 100 / entry.getActivityCount() : 0;
            if (improverScore > maxImproverScore && entry.getActivityCount() >= 5) maxImproverScore = improverScore;
        }

        com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardEntryDto currentUserEntry = null;
        for (int i = 0; i < entries.size(); i++) {
            com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardEntryDto entry = entries.get(i);
            
            // Best Performer
            if (i == 0 && entry.getMonthlyScore() > 0) {
                entry.getAwards().add("Best Performer");
            }
            // Most Consistent
            if (Long.valueOf(entry.getActivityCount()).equals(maxActivities) && maxActivities >= 10 && !entry.getAwards().contains("Best Performer")) {
                entry.getAwards().add("Most Consistent User");
            }
            // Highest Goal Completion
            if (Long.valueOf(entry.getGoalsCompleted()).equals(maxGoals) && maxGoals >= 1) {
                entry.getAwards().add("Highest Goal Completion");
            }
            // Top Improver
            long improverScore = entry.getActivityCount() > 0 ? recentActivityCounts.getOrDefault(entry.getUserId(), 0L) * 100 / entry.getActivityCount() : 0;
            if (improverScore == maxImproverScore && maxImproverScore > 60 && entry.getActivityCount() >= 5) {
                entry.getAwards().add("Top Improver");
            }

            if (currentUserEmail != null && userRepository.findByEmail(currentUserEmail).isPresent() &&
                entry.getUserId().equals(userRepository.findByEmail(currentUserEmail).get().getId())) {
                currentUserEntry = entry;
            }
        }

        List<com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardEntryDto> topUsers = entries.stream().limit(100).collect(Collectors.toList());

        return com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardResponseDto.builder()
                .topUsers(topUsers)
                .currentUser(currentUserEntry)
                .totalUsers(entries.size())
                .monthStartDate(monthStart)
                .monthEndDate(monthEnd)
                .build();
    }

    @Override
    public java.util.List<com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardEntryDto> getMonthlyLeaderboardHistory(java.time.LocalDate monthStart, java.time.LocalDate monthEnd) {
        List<com.carbonfootprint.entity.MonthlyLeaderboardHistory> histories = monthlyLeaderboardHistoryRepository.findByMonthStartDateAndMonthEndDateOrderByRankAsc(monthStart, monthEnd);
        return histories.stream().map(h -> {
            List<String> awards = h.getAwardType() != null ? Arrays.asList(h.getAwardType().split(",")) : new ArrayList<>();
            return com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardEntryDto.builder()
                .userId(h.getUser().getId())
                .firstName(h.getUser().getFirstName())
                .lastName(h.getUser().getLastName())
                .username(h.getUser().getUsername())
                .rank(h.getRank())
                .monthlyScore(h.getMonthlyScore())
                .carbonSaved(h.getCarbonSaved())
                .goalsCompleted(h.getGoalsCompleted())
                .activityCount(h.getActivityCount())
                .badgesEarned(h.getBadgesEarned())
                .awards(awards)
                .build();
        }).collect(Collectors.toList());
    }
    
    @Scheduled(cron = "0 59 23 L * ?") // Last day of the month at 23:59
    public void snapshotMonthlyLeaderboard() {
        log.info("Snapshotting monthly leaderboard to history...");
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate monthStart = today.withDayOfMonth(1);
        java.time.LocalDate monthEnd = today.withDayOfMonth(today.lengthOfMonth());

        com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardResponseDto monthly = getMonthlyLeaderboard(null, monthStart, monthEnd, null, null);
        
        List<com.carbonfootprint.entity.MonthlyLeaderboardHistory> histories = new ArrayList<>();
        for (com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardEntryDto dto : monthly.getTopUsers()) {
            User user = userRepository.findById(dto.getUserId()).orElse(null);
            if (user != null) {
                String awardsStr = String.join(",", dto.getAwards());
                com.carbonfootprint.entity.MonthlyLeaderboardHistory h = com.carbonfootprint.entity.MonthlyLeaderboardHistory.builder()
                        .user(user)
                        .monthStartDate(monthStart)
                        .monthEndDate(monthEnd)
                        .rank(dto.getRank())
                        .monthlyScore(dto.getMonthlyScore())
                        .carbonSaved(dto.getCarbonSaved())
                        .goalsCompleted(dto.getGoalsCompleted())
                        .activityCount(dto.getActivityCount())
                        .badgesEarned(dto.getBadgesEarned())
                        .awardType(awardsStr.isEmpty() ? null : awardsStr)
                        .build();
                histories.add(h);
            }
        }
        monthlyLeaderboardHistoryRepository.saveAll(histories);
        log.info("Saved {} users to monthly leaderboard history.", histories.size());
    }

    @Override
    @Cacheable(value = LEADERBOARD_CACHE, key = "'yearly_' + #year + '_' + (#category != null ? #category : 'all') + '_' + (#sortBy != null ? #sortBy : 'score')")
    public com.carbonfootprint.dto.leaderboard.YearlyLeaderboardResponseDto getYearlyLeaderboard(String currentUserEmail, int year, String category, String sortBy) {
        log.info("Calculating yearly leaderboard for year {}", year);
        List<User> allUsers = userRepository.findAll();
        
        java.time.LocalDate yearStart = java.time.LocalDate.of(year, 1, 1);
        java.time.LocalDate yearEnd = java.time.LocalDate.of(year, 12, 31);
        java.time.LocalDateTime startDateTime = yearStart.atStartOfDay();
        java.time.LocalDateTime endDateTime = yearEnd.atTime(23, 59, 59);

        // Fetch grouped stats for date range
        Map<Long, Long> activityCounts;
        Map<Long, java.math.BigDecimal> userEmissions;
        
        if (category != null && !category.equalsIgnoreCase("Overall")) {
            activityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndDateRangeAndCategory(yearStart, yearEnd, category));
            userEmissions = extractEmissions(activityLogRepository.sumEmissionsGroupedByUserAndDateRangeAndCategory(yearStart, yearEnd, category));
        } else {
            activityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndDateRange(yearStart, yearEnd));
            userEmissions = extractEmissions(activityLogRepository.sumEmissionsGroupedByUserAndDateRange(yearStart, yearEnd));
        }
        
        Map<Long, Long> completedGoals = extractCounts(goalRepository.countCompletedGoalsGroupedByUserAndDateRange(startDateTime, endDateTime));
        Map<Long, Long> badgeCounts = extractCounts(userBadgeRepository.countBadgesGroupedByUserAndDateRange(startDateTime, endDateTime));

        List<com.carbonfootprint.dto.leaderboard.YearlyLeaderboardEntryDto> entries = new ArrayList<>();

        for (User user : allUsers) {
            Long userId = user.getId();
            
            long acts = activityCounts.getOrDefault(userId, 0L);
            long goals = completedGoals.getOrDefault(userId, 0L);
            long badges = badgeCounts.getOrDefault(userId, 0L);
            java.math.BigDecimal emissions = userEmissions.getOrDefault(userId, java.math.BigDecimal.ZERO);
            
            long activeWeeks = acts > 0 ? (acts > 50 ? 52 : acts) : 0;
            
            Map<String, Long> scores = scoringEngineService.calculateSustainabilityScore(
                    user, startDateTime, endDateTime);

            entries.add(com.carbonfootprint.dto.leaderboard.YearlyLeaderboardEntryDto.builder()
                    .userId(userId)
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .username(user.getUsername())
                    .profilePictureUrl(user.getProfilePictureUrl())
                    .yearlyScore(scores.get("totalScore"))
                    .carbonSaved(emissions)
                    .goalsCompleted((int)goals)
                    .badgePoints(scores.get("badgeScore"))
                    .participationScore(scores.get("participationScore"))
                    .goalScore(scores.get("goalScore"))
                    .badgeScore(scores.get("badgeScore"))
                    .carbonReductionScore(scores.get("carbonReductionScore"))
                    .consistencyScore(scores.get("consistencyScore"))
                    .improvementScore(scores.get("improvementScore"))
                    .build());
        }

        // Sort descending
        if ("Most Goals Completed".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Integer.compare(b.getGoalsCompleted() != null ? b.getGoalsCompleted() : 0, a.getGoalsCompleted() != null ? a.getGoalsCompleted() : 0));
        } else if ("Most Improved".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Long.compare(b.getImprovementScore() != null ? b.getImprovementScore() : 0L, a.getImprovementScore() != null ? a.getImprovementScore() : 0L));
        } else {
            entries.sort((a, b) -> Long.compare(b.getYearlyScore() != null ? b.getYearlyScore() : 0L, a.getYearlyScore() != null ? a.getYearlyScore() : 0L));
        }

        com.carbonfootprint.dto.leaderboard.YearlyLeaderboardEntryDto currentUserEntry = null;
        for (int i = 0; i < entries.size(); i++) {
            com.carbonfootprint.dto.leaderboard.YearlyLeaderboardEntryDto entry = entries.get(i);
            entry.setRank(i + 1);
            
            // Awards logic
            if (entry.getYearlyScore() > 0) {
                if (entry.getRank() == 1) entry.setAward("Gold");
                else if (entry.getRank() == 2) entry.setAward("Silver");
                else if (entry.getRank() == 3) entry.setAward("Bronze");
                else if (entry.getRank() <= 10) entry.setAward("Top 10");
                else if (entry.getRank() <= 100) entry.setAward("Top 100");
            }

            if (currentUserEmail != null && userRepository.findByEmail(currentUserEmail).isPresent() &&
                entry.getUserId().equals(userRepository.findByEmail(currentUserEmail).get().getId())) {
                currentUserEntry = entry;
            }
        }

        List<com.carbonfootprint.dto.leaderboard.YearlyLeaderboardEntryDto> topUsers = entries.stream().limit(100).collect(Collectors.toList());

        return com.carbonfootprint.dto.leaderboard.YearlyLeaderboardResponseDto.builder()
                .topUsers(topUsers)
                .currentUser(currentUserEntry)
                .totalUsers(entries.size())
                .year(year)
                .build();
    }

    @Override
    public java.util.List<com.carbonfootprint.dto.leaderboard.YearlyLeaderboardEntryDto> getYearlyLeaderboardHistory(int year) {
        List<com.carbonfootprint.entity.YearlyLeaderboardHistory> histories = yearlyLeaderboardHistoryRepository.findByYearOrderByRankAsc(year);
        return histories.stream().map(h -> com.carbonfootprint.dto.leaderboard.YearlyLeaderboardEntryDto.builder()
                .userId(h.getUser().getId())
                .firstName(h.getUser().getFirstName())
                .lastName(h.getUser().getLastName())
                .username(h.getUser().getUsername())
                .rank(h.getRank())
                .yearlyScore(h.getYearlyScore())
                .carbonSaved(h.getCarbonSaved())
                .goalsCompleted(h.getGoalsCompleted())
                .badgePoints(h.getBadgePoints())
                .award(h.getAwardType())
                .build()).collect(Collectors.toList());
    }

    @Scheduled(cron = "0 59 23 31 12 ?") // Dec 31st at 23:59
    public void snapshotYearlyLeaderboard() {
        log.info("Snapshotting yearly leaderboard to history...");
        int year = java.time.LocalDate.now().getYear();

        com.carbonfootprint.dto.leaderboard.YearlyLeaderboardResponseDto yearly = getYearlyLeaderboard(null, year, null, null);
        
        List<com.carbonfootprint.entity.YearlyLeaderboardHistory> histories = new ArrayList<>();
        for (com.carbonfootprint.dto.leaderboard.YearlyLeaderboardEntryDto dto : yearly.getTopUsers()) {
            User user = userRepository.findById(dto.getUserId()).orElse(null);
            if (user != null) {
                com.carbonfootprint.entity.YearlyLeaderboardHistory h = com.carbonfootprint.entity.YearlyLeaderboardHistory.builder()
                        .user(user)
                        .year(year)
                        .rank(dto.getRank())
                        .yearlyScore(dto.getYearlyScore())
                        .carbonSaved(dto.getCarbonSaved())
                        .goalsCompleted(dto.getGoalsCompleted())
                        .badgePoints(dto.getBadgePoints())
                        .awardType(dto.getAward())
                        .build();
                histories.add(h);
            }
        }
        yearlyLeaderboardHistoryRepository.saveAll(histories);
        log.info("Saved {} users to yearly leaderboard history.", histories.size());

        // Publish event for top 100 users
        histories.stream().limit(100).forEach(h -> {
            eventPublisher.publishEvent(new UserMetricsUpdatedEvent(this, h.getUser().getId()));
        });
    }

    @Override
    public com.carbonfootprint.dto.leaderboard.UserLeaderboardStatsDto getUserLeaderboardStats(String currentUserEmail) {
        if (currentUserEmail == null) return null;
        try {
            User user = userRepository.findByEmail(currentUserEmail).orElse(null);
            if (user == null) return null;

            // Fetch Current Global Score and Rank
            LeaderboardResponseDto global = getLeaderboard(currentUserEmail, null, null);
            Integer currentRank = global != null && global.getCurrentUser() != null ? global.getCurrentUser().getRank() : null;
            Long currentScore = global != null && global.getCurrentUser() != null ? global.getCurrentUser().getTotalSustainabilityScore() : 0L;

            // Fetch Weekly
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
            com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardResponseDto weekly = getWeeklyLeaderboard(currentUserEmail, weekStart, today, null, null);
            Long weeklyScore = weekly != null && weekly.getCurrentUser() != null ? weekly.getCurrentUser().getWeeklyScore() : 0L;

            // Fetch Monthly
            java.time.LocalDate monthStart = today.withDayOfMonth(1);
            com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardResponseDto monthly = getMonthlyLeaderboard(currentUserEmail, monthStart, today, null, null);
            Long monthlyScore = monthly != null && monthly.getCurrentUser() != null ? monthly.getCurrentUser().getMonthlyScore() : 0L;

            // Fetch Yearly
            com.carbonfootprint.dto.leaderboard.YearlyLeaderboardResponseDto yearly = getYearlyLeaderboard(currentUserEmail, today.getYear(), null, null);
            Long yearlyScore = yearly != null && yearly.getCurrentUser() != null ? yearly.getCurrentUser().getYearlyScore() : 0L;

            // Previous and Best Rank from History
            Integer previousRank = null;
            Integer bestRank = null;
            String trend = "UNCHANGED";

            try {
                java.util.Optional<com.carbonfootprint.entity.WeeklyLeaderboardHistory> bestHistory = weeklyLeaderboardHistoryRepository.findTopByUserOrderByRankAsc(user);
                if (bestHistory.isPresent()) {
                    bestRank = bestHistory.get().getRank();
                }

                java.util.Optional<com.carbonfootprint.entity.WeeklyLeaderboardHistory> prevHistory = weeklyLeaderboardHistoryRepository.findTopByUserOrderByWeekEndDateDesc(user);
                if (prevHistory.isPresent()) {
                    previousRank = prevHistory.get().getRank();
                }
            } catch (Exception e) {
                log.warn("Could not query leaderboard history for user {}: {}", user.getId(), e.getMessage());
            }

            if (currentRank != null && previousRank != null) {
                if (currentRank < previousRank) {
                    trend = "IMPROVED";
                } else if (currentRank > previousRank) {
                    trend = "DROPPED";
                }
            } else if (currentRank != null) {
                trend = "IMPROVED";
                bestRank = bestRank == null || currentRank < bestRank ? currentRank : bestRank;
                previousRank = currentRank;
            }

            return com.carbonfootprint.dto.leaderboard.UserLeaderboardStatsDto.builder()
                    .currentRank(currentRank != null ? currentRank : 1)
                    .previousRank(previousRank != null ? previousRank : 1)
                    .bestRank(bestRank != null ? bestRank : (currentRank != null ? currentRank : 1))
                    .currentScore(currentScore != null ? currentScore : 0L)
                    .weeklyScore(weeklyScore != null ? weeklyScore : 0L)
                    .monthlyScore(monthlyScore != null ? monthlyScore : 0L)
                    .yearlyScore(yearlyScore != null ? yearlyScore : 0L)
                    .trend(trend)
                    .build();
        } catch (Exception e) {
            log.error("Error generating user leaderboard stats for {}: ", currentUserEmail, e);
            return com.carbonfootprint.dto.leaderboard.UserLeaderboardStatsDto.builder()
                    .currentRank(1)
                    .previousRank(1)
                    .bestRank(1)
                    .currentScore(0L)
                    .weeklyScore(0L)
                    .monthlyScore(0L)
                    .yearlyScore(0L)
                    .trend("UNCHANGED")
                    .build();
        }
    }

    private Map<Long, java.math.BigDecimal> extractEmissions(List<Object[]> results) {
        Map<Long, java.math.BigDecimal> map = new HashMap<>();
        if (results == null) return map;
        for (Object[] row : results) {
            if (row == null || row.length < 2 || row[0] == null || row[1] == null) continue;
            Long userId = ((Number) row[0]).longValue();
            java.math.BigDecimal val;
            if (row[1] instanceof java.math.BigDecimal) {
                val = (java.math.BigDecimal) row[1];
            } else if (row[1] instanceof Number) {
                val = java.math.BigDecimal.valueOf(((Number) row[1]).doubleValue());
            } else {
                val = java.math.BigDecimal.ZERO;
            }
            map.put(userId, val);
        }
        return map;
    }

    private Map<Long, Long> extractCounts(List<Object[]> results) {
        Map<Long, Long> map = new HashMap<>();
        if (results == null) return map;
        for (Object[] row : results) {
            if (row == null || row.length < 2 || row[0] == null || row[1] == null) continue;
            Long userId = ((Number) row[0]).longValue();
            Long count = ((Number) row[1]).longValue();
            map.put(userId, count);
        }
        return map;
    }
}
