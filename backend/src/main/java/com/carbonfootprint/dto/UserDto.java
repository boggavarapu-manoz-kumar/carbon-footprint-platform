package com.carbonfootprint.dto;

import com.carbonfootprint.entity.Role;
import com.carbonfootprint.entity.AuthProvider;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private AuthProvider provider;
    private String profilePictureUrl;
    private String sustainabilityPreferences;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
