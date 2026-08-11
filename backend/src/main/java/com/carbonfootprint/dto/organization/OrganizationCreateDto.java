package com.carbonfootprint.dto.organization;

import lombok.Data;

@Data
public class OrganizationCreateDto {
    private String name;
    private String industry;
    private String companySize;
    private String country;
    private String timezone;
}
