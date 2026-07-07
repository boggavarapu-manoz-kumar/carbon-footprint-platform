package com.carbonfootprint.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserStatusUpdateRequest {

    @NotBlank(message = "Status cannot be blank")
    @Pattern(regexp = "^(ACTIVE|SUSPENDED|LOCKED)$", message = "Invalid status value")
    private String status;

    @Size(max = 255, message = "Reason must not exceed 255 characters")
    private String reason;
}
