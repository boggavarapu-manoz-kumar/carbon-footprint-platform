package com.carbonfootprint.dto.organization;

import com.carbonfootprint.entity.organization.OrganizationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class OrganizationDto {
    private Long id;
    private String name;
    private String code;
    private String industry;
    private String companySize;
    private String country;
    private String timezone;
    private String logo;
    private OrganizationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
