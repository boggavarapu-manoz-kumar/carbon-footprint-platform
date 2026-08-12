package com.carbonfootprint.dto.organization;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateOrganizationDto {
    @NotBlank(message = "Organization name is required")
    private String name;
    
    private String industry;
    private String companySize;
    private String country;
    private String timezone;
    private String logo;

    // Admin Details for initial assignment
    @NotBlank(message = "Admin name is required")
    private String adminName;

    @NotBlank(message = "Admin email is required")
    @Email(message = "Admin email must be valid")
    private String adminEmail;

    private String adminIdentifier; // Optional
}
