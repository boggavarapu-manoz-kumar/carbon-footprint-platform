package com.carbonfootprint.dto.organization;

import lombok.Data;

@Data
public class OrganizationInvitationCreateDto {
    private String email;
    private String employeeId;
    private String department;
    private String jobTitle;
    private String role;
}
