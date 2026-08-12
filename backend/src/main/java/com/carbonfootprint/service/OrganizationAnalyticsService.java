package com.carbonfootprint.service;

import com.carbonfootprint.dto.organization.analytics.OrganizationAnalyticsDto;

public interface OrganizationAnalyticsService {
    OrganizationAnalyticsDto getAnalytics(Long organizationId, String period, String customStartDate, String customEndDate);
}
