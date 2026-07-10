package com.carbonfootprint.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationAnalyticsResponse {

    private long totalOrganizations;
    private BigDecimal totalOrganizationEmissions;
    
    private List<OrganizationRank> rankings;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizationRank {
        private String name;
        private String industry;
        private long memberCount;
        private BigDecimal totalEmissions;
        private BigDecimal avgEmissionsPerMember;
    }
}
