package com.carbonfootprint.dto;

import com.carbonfootprint.entity.AuthProvider;
import com.carbonfootprint.entity.Role;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String mobileNumber;
    private String gender;
    private String email;
    private Role role;
    private AuthProvider provider;
    private String profilePictureUrl;
    private String sustainabilityPreferences;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastUsernameChangeDate;
}
