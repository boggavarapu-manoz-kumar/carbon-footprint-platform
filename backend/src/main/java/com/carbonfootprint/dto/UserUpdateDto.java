package com.carbonfootprint.dto;

import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserUpdateDto {

    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    String fullName;

    @Size(min = 6, message = "Password must be at least 6 characters long")
    String password;
}
