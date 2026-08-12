package com.carbonfootprint.dto.organization;

import com.carbonfootprint.entity.organization.MembershipStatus;
import com.carbonfootprint.entity.organization.OrganizationRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrganizationMembershipDto {
    private Long id;
    private Long organizationId;
    private String organizationName;
    private String organizationLogo;
    private OrganizationRole role;
    private MembershipStatus status;
    private String department;
    private String jobTitle;
    private String employeeId;
}
