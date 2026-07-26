import re

with open('src/main/java/com/carbonfootprint/service/impl/LeaderboardServiceImpl.java', 'r') as f:
    content = f.read()

# Update getLeaderboard
content = re.sub(
    r'@Cacheable\(value = LEADERBOARD_CACHE, key = "\'global\'"\)\s+public LeaderboardResponseDto getLeaderboard\(String currentUserEmail\) \{',
    '''@Cacheable(value = LEADERBOARD_CACHE, key = "'global_' + (#category != null ? #category : 'all') + '_' + (#sortBy != null ? #sortBy : 'score')")
    public LeaderboardResponseDto getLeaderboard(String currentUserEmail, String category, String sortBy) {''',
    content
)

content = content.replace(
    '''        // 1. Fetch grouped stats
        Map<Long, Long> activityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUser());
        Map<Long, Long> activeWeeks = extractCounts(activityLogRepository.countActiveWeeksGroupedByUser());''',
    '''        // 1. Fetch grouped stats
        Map<Long, Long> activityCounts;
        Map<Long, Long> activeWeeks;
        if (category != null && !category.equalsIgnoreCase("Overall")) {
            activityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndCategory(category));
            activeWeeks = extractCounts(activityLogRepository.countActiveWeeksGroupedByUserAndCategory(category));
        } else {
            activityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUser());
            activeWeeks = extractCounts(activityLogRepository.countActiveWeeksGroupedByUser());
        }'''
)

# Update getWeeklyLeaderboard
content = re.sub(
    r'@Cacheable\(value = LEADERBOARD_CACHE, key = "\'weekly_\' \+ #weekStart \+ \'_\' \+ #weekEnd"\)\s+public com\.carbonfootprint\.dto\.leaderboard\.WeeklyLeaderboardResponseDto getWeeklyLeaderboard\(String currentUserEmail, java\.time\.LocalDate weekStart, java\.time\.LocalDate weekEnd\) \{',
    '''@Cacheable(value = LEADERBOARD_CACHE, key = "'weekly_' + #weekStart + '_' + #weekEnd + '_' + (#category != null ? #category : 'all') + '_' + (#sortBy != null ? #sortBy : 'score')")
    public com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardResponseDto getWeeklyLeaderboard(String currentUserEmail, java.time.LocalDate weekStart, java.time.LocalDate weekEnd, String category, String sortBy) {''',
    content
)

content = content.replace(
    '''        // Fetch grouped stats for date range
        Map<Long, Long> activityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndDateRange(weekStart, weekEnd));
        Map<Long, Long> completedGoals = extractCounts(goalRepository.countCompletedGoalsGroupedByUserAndDateRange(startDateTime, endDateTime));
        Map<Long, Long> badgeCounts = extractCounts(userBadgeRepository.countBadgesGroupedByUserAndDateRange(startDateTime, endDateTime));
        
        // For challenges, if we don't have date range queries, fallback to 0 or write custom. For now, 0
        // Map<Long, Long> challengeCounts = ... (we skip for weekly to keep it simple, or we can use goals)
        
        // Fetch carbon reductions (emissions this week)
        Map<Long, java.math.BigDecimal> userEmissions = extractEmissions(activityLogRepository.sumEmissionsGroupedByUserAndDateRange(weekStart, weekEnd));''',
    '''        // Fetch grouped stats for date range
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
        Map<Long, Long> badgeCounts = extractCounts(userBadgeRepository.countBadgesGroupedByUserAndDateRange(startDateTime, endDateTime));'''
)

# Update getMonthlyLeaderboard
content = re.sub(
    r'@Cacheable\(value = LEADERBOARD_CACHE, key = "\'monthly_\' \+ #monthStart \+ \'_\' \+ #monthEnd"\)\s+public com\.carbonfootprint\.dto\.leaderboard\.MonthlyLeaderboardResponseDto getMonthlyLeaderboard\(String currentUserEmail, java\.time\.LocalDate monthStart, java\.time\.LocalDate monthEnd\) \{',
    '''@Cacheable(value = LEADERBOARD_CACHE, key = "'monthly_' + #monthStart + '_' + #monthEnd + '_' + (#category != null ? #category : 'all') + '_' + (#sortBy != null ? #sortBy : 'score')")
    public com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardResponseDto getMonthlyLeaderboard(String currentUserEmail, java.time.LocalDate monthStart, java.time.LocalDate monthEnd, String category, String sortBy) {''',
    content
)

content = content.replace(
    '''        // Fetch grouped stats for date range
        Map<Long, Long> activityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndDateRange(monthStart, monthEnd));
        Map<Long, Long> completedGoals = extractCounts(goalRepository.countCompletedGoalsGroupedByUserAndDateRange(startDateTime, endDateTime));
        Map<Long, Long> badgeCounts = extractCounts(userBadgeRepository.countBadgesGroupedByUserAndDateRange(startDateTime, endDateTime));
        
        // Fetch recent active weeks
        java.time.LocalDate recentStart = monthEnd.minusDays(14);
        Map<Long, Long> recentActivityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndDateRange(recentStart, monthEnd));

        // Fetch carbon reductions
        Map<Long, java.math.BigDecimal> userEmissions = extractEmissions(activityLogRepository.sumEmissionsGroupedByUserAndDateRange(monthStart, monthEnd));''',
    '''        // Fetch grouped stats for date range
        Map<Long, Long> activityCounts;
        Map<Long, Long> recentActivityCounts;
        Map<Long, java.math.BigDecimal> userEmissions;
        java.time.LocalDate recentStart = monthEnd.minusDays(14);
        
        if (category != null && !category.equalsIgnoreCase("Overall")) {
            activityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndDateRangeAndCategory(monthStart, monthEnd, category));
            recentActivityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndDateRangeAndCategory(recentStart, monthEnd, category));
            userEmissions = extractEmissions(activityLogRepository.sumEmissionsGroupedByUserAndDateRangeAndCategory(monthStart, monthEnd, category));
        } else {
            activityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndDateRange(monthStart, monthEnd));
            recentActivityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndDateRange(recentStart, monthEnd));
            userEmissions = extractEmissions(activityLogRepository.sumEmissionsGroupedByUserAndDateRange(monthStart, monthEnd));
        }
        Map<Long, Long> completedGoals = extractCounts(goalRepository.countCompletedGoalsGroupedByUserAndDateRange(startDateTime, endDateTime));
        Map<Long, Long> badgeCounts = extractCounts(userBadgeRepository.countBadgesGroupedByUserAndDateRange(startDateTime, endDateTime));'''
)

# Update getYearlyLeaderboard
content = re.sub(
    r'@Cacheable\(value = LEADERBOARD_CACHE, key = "\'yearly_\' \+ #year"\)\s+public com\.carbonfootprint\.dto\.leaderboard\.YearlyLeaderboardResponseDto getYearlyLeaderboard\(String currentUserEmail, int year\) \{',
    '''@Cacheable(value = LEADERBOARD_CACHE, key = "'yearly_' + #year + '_' + (#category != null ? #category : 'all') + '_' + (#sortBy != null ? #sortBy : 'score')")
    public com.carbonfootprint.dto.leaderboard.YearlyLeaderboardResponseDto getYearlyLeaderboard(String currentUserEmail, int year, String category, String sortBy) {''',
    content
)

content = content.replace(
    '''        // Fetch grouped stats for date range
        Map<Long, Long> activityCounts = extractCounts(activityLogRepository.countActivitiesGroupedByUserAndDateRange(yearStart, yearEnd));
        Map<Long, Long> completedGoals = extractCounts(goalRepository.countCompletedGoalsGroupedByUserAndDateRange(startDateTime, endDateTime));
        Map<Long, Long> badgeCounts = extractCounts(userBadgeRepository.countBadgesGroupedByUserAndDateRange(startDateTime, endDateTime));
        
        // Fetch carbon reductions
        Map<Long, java.math.BigDecimal> userEmissions = extractEmissions(activityLogRepository.sumEmissionsGroupedByUserAndDateRange(yearStart, yearEnd));''',
    '''        // Fetch grouped stats for date range
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
        Map<Long, Long> badgeCounts = extractCounts(userBadgeRepository.countBadgesGroupedByUserAndDateRange(startDateTime, endDateTime));'''
)

# Sorting replacer helper
sort_replacement = '''
        if ("Most Goals Completed".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Long.compare(b.getGoalsCompleted() != null ? b.getGoalsCompleted() : (b.getGoalScore() != null ? b.getGoalScore() : 0L), a.getGoalsCompleted() != null ? a.getGoalsCompleted() : (a.getGoalScore() != null ? a.getGoalScore() : 0L)));
        } else if ("Most Improved".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Long.compare(b.getImprovementScore() != null ? b.getImprovementScore() : 0L, a.getImprovementScore() != null ? a.getImprovementScore() : 0L));
        } else {
            entries.sort((a, b) -> Long.compare(b.getTotalScoreMethod(), a.getTotalScoreMethod()));
        }
'''

# Update getLeaderboard sorting
content = content.replace(
    '        Collections.sort(entries);',
    '''        if ("Most Goals Completed".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Long.compare(b.getGoalScore() != null ? b.getGoalScore() : 0L, a.getGoalScore() != null ? a.getGoalScore() : 0L));
        } else if ("Most Improved".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Long.compare(b.getImprovementScore() != null ? b.getImprovementScore() : 0L, a.getImprovementScore() != null ? a.getImprovementScore() : 0L));
        } else {
            entries.sort((a, b) -> Long.compare(b.getTotalSustainabilityScore() != null ? b.getTotalSustainabilityScore() : 0L, a.getTotalSustainabilityScore() != null ? a.getTotalSustainabilityScore() : 0L));
        }''',
    1
)

# Update getWeeklyLeaderboard sorting
content = content.replace(
    '        Collections.sort(entries);',
    '''        if ("Most Goals Completed".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Long.compare(b.getGoalScore() != null ? b.getGoalScore() : 0L, a.getGoalScore() != null ? a.getGoalScore() : 0L));
        } else if ("Most Improved".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Long.compare(b.getImprovementScore() != null ? b.getImprovementScore() : 0L, a.getImprovementScore() != null ? a.getImprovementScore() : 0L));
        } else {
            entries.sort((a, b) -> Long.compare(b.getWeeklyScore() != null ? b.getWeeklyScore() : 0L, a.getWeeklyScore() != null ? a.getWeeklyScore() : 0L));
        }''',
    1
)

# Update getMonthlyLeaderboard sorting
content = content.replace(
    '        Collections.sort(entries);',
    '''        if ("Most Goals Completed".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Integer.compare(b.getGoalsCompleted() != null ? b.getGoalsCompleted() : 0, a.getGoalsCompleted() != null ? a.getGoalsCompleted() : 0));
        } else if ("Most Improved".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Long.compare(b.getImprovementScore() != null ? b.getImprovementScore() : 0L, a.getImprovementScore() != null ? a.getImprovementScore() : 0L));
        } else {
            entries.sort((a, b) -> Long.compare(b.getMonthlyScore() != null ? b.getMonthlyScore() : 0L, a.getMonthlyScore() != null ? a.getMonthlyScore() : 0L));
        }''',
    1
)

# Update getYearlyLeaderboard sorting
content = content.replace(
    '        Collections.sort(entries);',
    '''        if ("Most Goals Completed".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Integer.compare(b.getGoalsCompleted() != null ? b.getGoalsCompleted() : 0, a.getGoalsCompleted() != null ? a.getGoalsCompleted() : 0));
        } else if ("Most Improved".equalsIgnoreCase(sortBy)) {
            entries.sort((a, b) -> Long.compare(b.getImprovementScore() != null ? b.getImprovementScore() : 0L, a.getImprovementScore() != null ? a.getImprovementScore() : 0L));
        } else {
            entries.sort((a, b) -> Long.compare(b.getYearlyScore() != null ? b.getYearlyScore() : 0L, a.getYearlyScore() != null ? a.getYearlyScore() : 0L));
        }''',
    1
)

# Update snapshotWeeklyLeaderboard
content = content.replace(
    'com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardResponseDto weekly = getWeeklyLeaderboard(null, weekStart, weekEnd);',
    'com.carbonfootprint.dto.leaderboard.WeeklyLeaderboardResponseDto weekly = getWeeklyLeaderboard(null, weekStart, weekEnd, null, null);'
)

# Update snapshotMonthlyLeaderboard
content = content.replace(
    'com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardResponseDto monthly = getMonthlyLeaderboard(null, monthStart, monthEnd);',
    'com.carbonfootprint.dto.leaderboard.MonthlyLeaderboardResponseDto monthly = getMonthlyLeaderboard(null, monthStart, monthEnd, null, null);'
)

# Update snapshotYearlyLeaderboard
content = content.replace(
    'com.carbonfootprint.dto.leaderboard.YearlyLeaderboardResponseDto yearly = getYearlyLeaderboard(null, year);',
    'com.carbonfootprint.dto.leaderboard.YearlyLeaderboardResponseDto yearly = getYearlyLeaderboard(null, year, null, null);'
)


with open('src/main/java/com/carbonfootprint/service/impl/LeaderboardServiceImpl.java', 'w') as f:
    f.write(content)

print("Patch applied successfully.")
