package com.carbonfootprint.dto.organization.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationAnalyticsDto {
    private Long organizationId;
    
    // KPI Metrics
    private Integer totalEmployees;
    private Integer activeEmployees;
    private Integer pendingInvitations;
    
    private Double totalFootprint; // In kg CO2
    private Double averageFootprintPerEmployee;
    private Double participationRate; // Percentage of employees logging activity
    
    // Goal Metrics (if any, using basic fields for now)
    private Double currentGoalTarget;
    private Double goalProgressPercentage;
    
    // Organization Points & Gamification
    private Integer totalOrganizationPoints;
    
    // Detailed Breakdowns
    private List<CategoryAnalyticsDto> categoryAnalytics;
    private List<TimeSeriesPointDto> timeSeriesAnalytics;
    
    // Period Context
    private String period; // e.g., "DAILY", "WEEKLY", "MONTHLY", "YEARLY", "CUSTOM"
    private Double previousPeriodTotalFootprint;
    private Double periodOverPeriodChange; // percentage
}
