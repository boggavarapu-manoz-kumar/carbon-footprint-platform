package com.carbonfootprint.dto.organization;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InviteEmployeeDto {
    @NotBlank(message = "Employee name is required")
    private String name;
    
    @NotBlank(message = "Employee email is required")
    @Email(message = "Employee email must be valid")
    private String email;
    
    private String department;
    private String jobTitle;
    private String employeeId;
}
