package com.carbonfootprint.dto;

import com.carbonfootprint.entity.Role;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class UserDto {
    Long id;
    String fullName;
    String email;
    Role role;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
