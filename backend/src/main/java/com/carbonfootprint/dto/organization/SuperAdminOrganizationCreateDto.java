package com.carbonfootprint.dto.organization;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class SuperAdminOrganizationCreateDto {
    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 100)
    private String industry;

    @Size(max = 50)
    private String companySize;

    @Size(max = 100)
    private String country;

    @Size(max = 100)
    private String timezone;

    private String logo;

    @NotBlank
    private String adminName;

    @NotBlank
    @Email
    private String adminEmail;
}
