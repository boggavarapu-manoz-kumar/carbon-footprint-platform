package com.carbonfootprint.dto.organization;

import com.carbonfootprint.entity.OrganizationRole;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OrganizationMemberDto {
    private Long id;
    private UserSummaryDto user;
    private OrganizationRole role;
    private String status;
    private String department;
    private String jobTitle;
    private String employeeId;
    private LocalDateTime joinedAt;
    private LocalDateTime lastActivity;

    @Data
    public static class UserSummaryDto {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
    }
}
