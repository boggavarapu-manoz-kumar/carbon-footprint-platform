package com.carbonfootprint.mapper;

import com.carbonfootprint.dto.UserCreateDto;
import com.carbonfootprint.dto.UserDto;
import com.carbonfootprint.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserCreateDto dto) {
        if (dto == null)
            return null;
        return User.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .username(dto.getUsername())
                .mobileNumber(dto.getMobileNumber())
                .gender(dto.getGender())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .build();
    }

    public UserDto toDto(User entity) {
        if (entity == null)
            return null;
        return UserDto.builder()
                .id(entity.getId())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .username(entity.getProfileUsername()) // use getProfileUsername to avoid getting email from Spring Security's getUsername
                .mobileNumber(entity.getMobileNumber())
                .gender(entity.getGender())
                .email(entity.getEmail())
                .role(entity.getRole())
                .provider(entity.getProvider())
                .profilePictureUrl(entity.getProfilePictureUrl())
                .sustainabilityPreferences(entity.getSustainabilityPreferences())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
