package com.carbonfootprint.mapper;

import com.carbonfootprint.dto.UserCreateDto;
import com.carbonfootprint.dto.UserDto;
import com.carbonfootprint.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("UserMapper Unit Tests")
class UserMapperTest {

    private UserMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new UserMapper();
    }

    @Test
    @DisplayName("toEntity should correctly map all fields from CreateDto")
    void toEntity_Success_AllFieldsMapped() {
        UserCreateDto dto = UserCreateDto.builder()
                .fullName("Jane Doe")
                .email("jane@example.com")
                .password("securePass123!")
                .build();

        User entity = mapper.toEntity(dto);

        assertThat(entity).isNotNull();
        assertThat(entity.getFirstName()).isEqualTo("Jane Doe");
        assertThat(entity.getEmail()).isEqualTo("jane@example.com");
    }

    @Test
    @DisplayName("toDto should correctly map all fields from User entity")
    void toDto_Success_AllFieldsMapped() {
        User user = User.builder()
                .id(42L)
                .fullName("John Doe")
                .email("john@example.com")
                .build();

        UserDto dto = mapper.toDto(user);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo(42L);
        assertThat(dto.getFirstName()).isEqualTo("John Doe");
        assertThat(dto.getEmail()).isEqualTo("john@example.com");
    }

    @Test
    @DisplayName("toEntity with null should return null")
    void toEntity_Null_ReturnsNull() {
        assertThat(mapper.toEntity(null)).isNull();
    }

    @Test
    @DisplayName("toDto with null should return null")
    void toDto_Null_ReturnsNull() {
        assertThat(mapper.toDto(null)).isNull();
    }
}
