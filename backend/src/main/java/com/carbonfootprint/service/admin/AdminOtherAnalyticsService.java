package com.carbonfootprint.service.admin;

import com.carbonfootprint.dto.admin.AdminOtherActivityAnalyticsResponse;
import com.carbonfootprint.dto.admin.CustomActivityStatDTO;
import com.carbonfootprint.repository.OtherActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminOtherAnalyticsService {

    private final OtherActivityLogRepository otherActivityLogRepository;

    private LocalDate getReferenceDate(Integer year) {
        LocalDate now = LocalDate.now();
        if (year == null || year == now.getYear()) {
            return now;
        }
        return LocalDate.of(year, 12, 31);
    }

    public AdminOtherActivityAnalyticsResponse getOtherActivityAnalytics(Integer year) {
        log.info("Fetching Other Activity Analytics for year: {}", year);
        
        LocalDate today = getReferenceDate(year);
        
        LocalDateTime startOfYear = today.withDayOfYear(1).atStartOfDay();
        LocalDateTime endOfYear = today.withDayOfYear(today.lengthOfYear()).atTime(23, 59, 59);

        Long totalActivities = otherActivityLogRepository.countGlobalActivitiesInRange(startOfYear.toLocalDate(), endOfYear.toLocalDate());
        BigDecimal totalEmissions = otherActivityLogRepository.sumGlobalEmissionsInRange(startOfYear.toLocalDate(), endOfYear.toLocalDate());

        if (totalActivities == null) totalActivities = 0L;
        if (totalEmissions == null) totalEmissions = BigDecimal.ZERO;

        List<Object[]> topUsageRaw = otherActivityLogRepository.findTopActivitiesByUsageInRange(startOfYear.toLocalDate(), endOfYear.toLocalDate(), PageRequest.of(0, 10));
        List<Object[]> topEmissionRaw = otherActivityLogRepository.findTopActivitiesByEmissionsInRange(startOfYear.toLocalDate(), endOfYear.toLocalDate(), PageRequest.of(0, 1));

        List<CustomActivityStatDTO> topActivities = new ArrayList<>();
        CustomActivityStatDTO mostUsed = null;
        
        for (int i = 0; i < topUsageRaw.size(); i++) {
            Object[] row = topUsageRaw.get(i);
            CustomActivityStatDTO dto = CustomActivityStatDTO.builder()
                .name((String) row[0])
                .usageCount(((Number) row[1]).longValue())
                .totalEmissions(row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO)
                .build();
            topActivities.add(dto);
            if (i == 0) mostUsed = dto;
        }

        CustomActivityStatDTO highestEmission = null;
        if (!topEmissionRaw.isEmpty()) {
            Object[] row = topEmissionRaw.get(0);
            highestEmission = CustomActivityStatDTO.builder()
                .name((String) row[0])
                .usageCount(((Number) row[1]).longValue())
                .totalEmissions(row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO)
                .build();
        }

        // Daily Breakdown (For today's trends)
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);
        List<Object[]> hourlyRaw = otherActivityLogRepository.getHourlyBreakdownGlobal(startOfDay.toLocalDate());
        Map<Integer, Object[]> hourMap = new HashMap<>();
        for (Object[] row : hourlyRaw) { hourMap.put(((Number) row[0]).intValue(), row); }
        
        List<AdminOtherActivityAnalyticsResponse.TrendDataPoint> dailyTrends = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            Object[] row = hourMap.get(h);
            long count = row != null ? ((Number) row[1]).longValue() : 0L;
            BigDecimal ems = row != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
            if (ems == null) ems = BigDecimal.ZERO;
            String label = (h == 0) ? "12 AM" : (h < 12) ? h + " AM" : (h == 12) ? "12 PM" : (h - 12) + " PM";
            dailyTrends.add(new AdminOtherActivityAnalyticsResponse.TrendDataPoint(label, count, ems));
        }

        // Weekly Breakdown (For current week)
        int dayOfWeekVal = today.getDayOfWeek().getValue();
        LocalDate startOfWeekDate = today.minusDays(dayOfWeekVal - 1);
        LocalDateTime startOfWeek = startOfWeekDate.atStartOfDay();
        LocalDateTime endOfWeek = startOfWeekDate.plusDays(6).atTime(23, 59, 59);
        List<Object[]> weekRaw = otherActivityLogRepository.getDailyBreakdownGlobal(startOfWeek, endOfWeek);
        Map<java.sql.Date, Object[]> weekMap = new HashMap<>();
        for (Object[] row : weekRaw) { weekMap.put((java.sql.Date) row[0], row); }

        List<AdminOtherActivityAnalyticsResponse.TrendDataPoint> weeklyTrends = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = startOfWeekDate.plusDays(i);
            java.sql.Date sqlDate = java.sql.Date.valueOf(d);
            Object[] row = weekMap.get(sqlDate);
            long count = row != null ? ((Number) row[1]).longValue() : 0L;
            BigDecimal ems = row != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
            if (ems == null) ems = BigDecimal.ZERO;
            String dayName = d.getDayOfWeek().name();
            dayName = dayName.substring(0, 1) + dayName.substring(1).toLowerCase();
            weeklyTrends.add(new AdminOtherActivityAnalyticsResponse.TrendDataPoint(dayName, count, ems));
        }

        // Monthly Breakdown (Weeks in current month)
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = today.withDayOfMonth(today.lengthOfMonth()).atTime(23, 59, 59);
        List<Object[]> monthRaw = otherActivityLogRepository.getDailyBreakdownGlobal(startOfMonth, endOfMonth);
        Map<java.sql.Date, Object[]> monthMap = new HashMap<>();
        for (Object[] row : monthRaw) { monthMap.put((java.sql.Date) row[0], row); }

        List<AdminOtherActivityAnalyticsResponse.TrendDataPoint> monthlyTrends = new ArrayList<>();
        for (int week = 1; week <= 5; week++) {
            long wCount = 0L;
            BigDecimal wEms = BigDecimal.ZERO;
            boolean hasDays = false;
            for (int d = 1; d <= 7; d++) {
                int dayOfMonth = ((week - 1) * 7) + d;
                if (dayOfMonth > today.lengthOfMonth()) break;
                LocalDate dDate = startOfMonth.toLocalDate().plusDays(dayOfMonth - 1);
                java.sql.Date sqlDate = java.sql.Date.valueOf(dDate);
                hasDays = true;
                Object[] row = monthMap.get(sqlDate);
                if (row != null) {
                    wCount += ((Number) row[1]).longValue();
                    wEms = wEms.add(row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO);
                }
            }
            if (hasDays) {
                monthlyTrends.add(new AdminOtherActivityAnalyticsResponse.TrendDataPoint("Week " + week, wCount, wEms));
            }
        }

        // Yearly Breakdown (Months in year)
        List<Object[]> yearRaw = otherActivityLogRepository.getDailyBreakdownGlobal(startOfYear, endOfYear);
        Map<java.sql.Date, Object[]> yearMap = new HashMap<>();
        for (Object[] row : yearRaw) { yearMap.put((java.sql.Date) row[0], row); }
        
        List<AdminOtherActivityAnalyticsResponse.TrendDataPoint> yearlyTrends = new ArrayList<>();
        String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        for (int m = 1; m <= 12; m++) {
            long mCount = 0L;
            BigDecimal mEms = BigDecimal.ZERO;
            LocalDate startOfM = today.withMonth(m).withDayOfMonth(1);
            int daysInM = startOfM.lengthOfMonth();
            for (int d = 1; d <= daysInM; d++) {
                LocalDate date = startOfM.withDayOfMonth(d);
                if (date.isAfter(today)) break;
                java.sql.Date sqlDate = java.sql.Date.valueOf(date);
                Object[] row = yearMap.get(sqlDate);
                if (row != null) {
                    mCount += ((Number) row[1]).longValue();
                    mEms = mEms.add(row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO);
                }
            }
            yearlyTrends.add(new AdminOtherActivityAnalyticsResponse.TrendDataPoint(monthNames[m-1], mCount, mEms));
        }

        return AdminOtherActivityAnalyticsResponse.builder()
                .totalActivities(totalActivities)
                .totalEmissions(totalEmissions)
                .mostUsedActivity(mostUsed)
                .highestEmissionActivity(highestEmission)
                .topActivities(topActivities)
                .dailyTrends(dailyTrends)
                .weeklyTrends(weeklyTrends)
                .monthlyTrends(monthlyTrends)
                .yearlyTrends(yearlyTrends)
                .build();
    }
}
