package com.carbonfootprint.dto.organization;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrganizationDto {
    private Long id;
    private String name;
    private String organizationCode;
    private String industry;
    private String companySize;
    private String country;
    private String timezone;
    private String logo;
    private String status;
    private String adminEmail;
    private String tempPassword;
    private String inviteLink;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
