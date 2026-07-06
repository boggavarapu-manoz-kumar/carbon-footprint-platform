package com.carbonfootprint.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateDto {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
    @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-Z0-9]([._](?![._])|[a-zA-Z0-9]){1,28}[a-zA-Z0-9]$", message = "Username must be 3-30 chars, letters, numbers, dots, underscores (no consecutive or trailing)")
    String username;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    String lastName;

    @Size(max = 15, message = "Mobile number cannot exceed 15 characters")
    String mobileNumber;

    @Size(max = 20, message = "Gender cannot exceed 20 characters")
    String gender;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
    @jakarta.validation.constraints.Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$", message = "Password must contain at least one digit, one lowercase, one uppercase, and one special character")
    String password;

    @NotBlank(message = "Confirm Password is required")
    String confirmPassword;
}
