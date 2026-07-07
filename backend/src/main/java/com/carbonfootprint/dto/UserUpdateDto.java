package com.carbonfootprint.dto;

import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDto {

    @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
    @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-Z0-9]([._](?![._])|[a-zA-Z0-9]){1,28}[a-zA-Z0-9]$", message = "Username must be 3-30 chars, letters, numbers, dots, underscores (no consecutive or trailing)")
    private String username;

    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    private String firstName;

    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    private String lastName;

    @Size(max = 20, message = "Mobile number cannot exceed 20 characters")
    private String mobileNumber;

    private String profilePictureUrl;

    @Size(max = 500, message = "Preferences cannot exceed 500 characters")
    private String sustainabilityPreferences;

    private String gender;

    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;
}
