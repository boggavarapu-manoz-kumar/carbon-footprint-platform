package com.carbonfootprint.dto.organization;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrganizationInvitationDto {
    private Long id;
    private Long organizationId;
    private String email;
    private String employeeId;
    private String department;
    private String jobTitle;
    private String status;
    private String role;
    private String token;
    private String inviteLink;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
