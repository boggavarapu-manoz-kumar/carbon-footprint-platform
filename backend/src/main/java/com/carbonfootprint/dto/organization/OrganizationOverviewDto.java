package com.carbonfootprint.dto.organization;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationOverviewDto {
    private Long id;
    private String name;
    private String organizationCode;
    private String status;
    private LocalDateTime createdAt;
    
    private long memberCount;
    private long activeMembers;
    private long pendingInvitations;
    private int setupProgress; // Percentage 0-100
}
