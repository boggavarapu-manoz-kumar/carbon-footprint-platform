package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.organization.analytics.CategoryAnalyticsDto;
import com.carbonfootprint.dto.organization.analytics.OrganizationAnalyticsDto;
import com.carbonfootprint.dto.organization.analytics.TimeSeriesPointDto;
import com.carbonfootprint.entity.organization.MembershipStatus;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.OrganizationMembershipRepository;
import com.carbonfootprint.service.OrganizationAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrganizationAnalyticsServiceImpl implements OrganizationAnalyticsService {

    private final ActivityLogRepository activityLogRepository;
    private final OrganizationMembershipRepository membershipRepository;

    @Override
    @Transactional(readOnly = true)
    public OrganizationAnalyticsDto getAnalytics(Long organizationId, String period, String customStartDate, String customEndDate) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;
        
        LocalDate prevStartDate = null;
        LocalDate prevEndDate = null;

        // Determine Date Range
        if ("DAILY".equalsIgnoreCase(period)) {
            startDate = endDate.minusDays(7); // Last 7 days
            prevEndDate = startDate.minusDays(1);
            prevStartDate = prevEndDate.minusDays(7);
        } else if ("MONTHLY".equalsIgnoreCase(period)) {
            startDate = endDate.minusMonths(1).withDayOfMonth(1);
            endDate = startDate.plusMonths(1).minusDays(1);
            prevStartDate = startDate.minusMonths(1);
            prevEndDate = prevStartDate.plusMonths(1).minusDays(1);
        } else if ("YEARLY".equalsIgnoreCase(period)) {
            startDate = endDate.withDayOfYear(1);
            prevStartDate = startDate.minusYears(1);
            prevEndDate = prevStartDate.plusYears(1).minusDays(1);
        } else if ("CUSTOM".equalsIgnoreCase(period) && customStartDate != null && customEndDate != null) {
            startDate = LocalDate.parse(customStartDate);
            endDate = LocalDate.parse(customEndDate);
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
            prevEndDate = startDate.minusDays(1);
            prevStartDate = prevEndDate.minusDays(daysBetween);
        } else {
            // Default WEEKLY
            startDate = endDate.minusWeeks(4);
            prevEndDate = startDate.minusDays(1);
            prevStartDate = prevEndDate.minusWeeks(4);
            period = "WEEKLY";
        }
        
        final String finalPeriod = period;

        // Employee Counts
        long totalEmployeesCount = membershipRepository.countByOrganizationId(organizationId);
        long activeEmployeesCount = membershipRepository.countByOrganizationIdAndStatus(organizationId, MembershipStatus.ACTIVE);
        long pendingInvitationsCount = membershipRepository.countByOrganizationIdAndStatus(organizationId, MembershipStatus.INVITED);

        // Footprint totals
        BigDecimal totalFootprint = activityLogRepository.sumEmissionsByOrganizationIdAndDateRange(organizationId, startDate, endDate);
        if (totalFootprint == null) totalFootprint = BigDecimal.ZERO;
        
        BigDecimal prevTotalFootprint = activityLogRepository.sumEmissionsByOrganizationIdAndDateRange(organizationId, prevStartDate, prevEndDate);
        if (prevTotalFootprint == null) prevTotalFootprint = BigDecimal.ZERO;
        
        Double avgFootprint = activeEmployeesCount > 0 ? totalFootprint.doubleValue() / activeEmployeesCount : 0.0;
        
        Double periodOverPeriodChange = 0.0;
        if (prevTotalFootprint.compareTo(BigDecimal.ZERO) > 0) {
            periodOverPeriodChange = ((totalFootprint.doubleValue() - prevTotalFootprint.doubleValue()) / prevTotalFootprint.doubleValue()) * 100;
        }

        // Categories
        List<Object[]> categoryResults = activityLogRepository.sumEmissionsGroupedByCategoryAndOrgAndDateRange(organizationId, startDate, endDate);
        List<Object[]> prevCategoryResults = activityLogRepository.sumEmissionsGroupedByCategoryAndOrgAndDateRange(organizationId, prevStartDate, prevEndDate);
        
        Map<String, Double> prevCategoryMap = prevCategoryResults.stream()
            .collect(Collectors.toMap(
                row -> (String) row[0],
                row -> ((BigDecimal) row[1]).doubleValue()
            ));

        List<CategoryAnalyticsDto> categoryAnalytics = new ArrayList<>();
        for (Object[] row : categoryResults) {
            String category = (String) row[0];
            Double value = ((BigDecimal) row[1]).doubleValue();
            Double percentage = totalFootprint.doubleValue() > 0 ? (value / totalFootprint.doubleValue()) * 100 : 0.0;
            
            Double prevValue = prevCategoryMap.getOrDefault(category, 0.0);
            Double percentageChange = 0.0;
            if (prevValue > 0) {
                percentageChange = ((value - prevValue) / prevValue) * 100;
            }
            
            categoryAnalytics.add(CategoryAnalyticsDto.builder()
                .category(category)
                .totalEmissions(value)
                .percentage(percentage)
                .previousPeriodEmissions(prevValue)
                .percentageChange(percentageChange)
                .build());
        }

        // Time Series
        List<Object[]> timeSeriesResults = activityLogRepository.sumEmissionsGroupedByDateAndOrgAndDateRange(organizationId, startDate, endDate);
        List<TimeSeriesPointDto> timeSeriesAnalytics = timeSeriesResults.stream()
            .map(row -> {
                LocalDate date = (LocalDate) row[0];
                Double val = ((BigDecimal) row[1]).doubleValue();
                
                String dateStr = date.toString();
                if ("MONTHLY".equalsIgnoreCase(finalPeriod) || "YEARLY".equalsIgnoreCase(finalPeriod)) {
                    dateStr = date.format(DateTimeFormatter.ofPattern("MMM yyyy"));
                }
                
                return TimeSeriesPointDto.builder()
                    .date(dateStr)
                    .totalEmissions(val)
                    .build();
            })
            .collect(Collectors.toList());

        // Basic Goal (Mocked for now since Entity doesn't exist)
        Double currentGoalTarget = 5000.0 * activeEmployeesCount; // Example mock goal
        Double goalProgressPercentage = currentGoalTarget > 0 ? (totalFootprint.doubleValue() / currentGoalTarget) * 100 : 0.0;

        return OrganizationAnalyticsDto.builder()
            .organizationId(organizationId)
            .totalEmployees((int) totalEmployeesCount)
            .activeEmployees((int) activeEmployeesCount)
            .pendingInvitations((int) pendingInvitationsCount)
            .totalFootprint(totalFootprint.doubleValue())
            .averageFootprintPerEmployee(avgFootprint)
            .participationRate(activeEmployeesCount > 0 ? 100.0 : 0.0) // Mocking participation rate for now
            .categoryAnalytics(categoryAnalytics)
            .timeSeriesAnalytics(timeSeriesAnalytics)
            .period(period.toUpperCase())
            .previousPeriodTotalFootprint(prevTotalFootprint.doubleValue())
            .periodOverPeriodChange(periodOverPeriodChange)
            .currentGoalTarget(currentGoalTarget)
            .goalProgressPercentage(goalProgressPercentage)
            .totalOrganizationPoints(0)
            .build();
    }
}
