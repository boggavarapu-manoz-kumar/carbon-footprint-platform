package com.carbonfootprint.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActivationRequestDto {
    @NotBlank
    private String token;

    @NotBlank
    @Size(min = 2)
    private String firstName;

    @NotBlank
    @Size(min = 2)
    private String lastName;

    @NotBlank
    @Size(min = 8)
    private String password;
}
