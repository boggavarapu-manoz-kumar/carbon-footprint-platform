package com.carbonfootprint.dto.organization;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmployeeActivationDto {
    @NotBlank
    private String token;
    
    @NotBlank
    private String password;
    
    @NotBlank
    private String firstName;
    
    @NotBlank
    private String lastName;
}
