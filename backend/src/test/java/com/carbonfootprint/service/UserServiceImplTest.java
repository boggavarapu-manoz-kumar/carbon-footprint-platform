package com.carbonfootprint.service;

import com.carbonfootprint.dto.UserCreateDto;
import com.carbonfootprint.dto.UserDto;
import com.carbonfootprint.dto.UserUpdateDto;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.exception.BadRequestException;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.mapper.UserMapper;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Unit Tests")
class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private UserMapper userMapper;

    @InjectMocks private UserServiceImpl userService;

    private User user;
    private UserDto userDto;
    private UserCreateDto createDto;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("test@example.com").firstName("Test").lastName("User").username("test_user").build();
        userDto = UserDto.builder().id(1L).email("test@example.com").firstName("Test").lastName("User").username("test_user").build();
        createDto = UserCreateDto.builder().email("test@example.com").firstName("Test").lastName("User").username("test_user").password("Pass@1234").build();
    }

    @Nested
    @DisplayName("Create User")
    class CreateUser {

        @Test
        @DisplayName("Should create user successfully when email is unique")
        void createUser_Success() {
            when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
            when(userMapper.toEntity(createDto)).thenReturn(user);
            when(userRepository.save(user)).thenReturn(user);
            when(userMapper.toDto(user)).thenReturn(userDto);

            UserDto result = userService.createUser(createDto);

            assertThat(result.getEmail()).isEqualTo("test@example.com");
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw BadRequestException when email already exists")
        void createUser_DuplicateEmail_ThrowsBadRequest() {
            when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

            assertThatThrownBy(() -> userService.createUser(createDto))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Email already registered");

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Get User")
    class GetUser {

        @Test
        @DisplayName("Should return user when found by ID")
        void getUserById_Success() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userMapper.toDto(user)).thenReturn(userDto);

            assertThat(userService.getUserById(1L).getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when user not found")
        void getUserById_NotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getUserById(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Should return user when found by email")
        void getUserByEmail_Success() {
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
            when(userMapper.toDto(user)).thenReturn(userDto);

            assertThat(userService.getUserByEmail("test@example.com").getEmail()).isEqualTo("test@example.com");
        }

        @Test
        @DisplayName("Should return empty page when no users exist")
        void getAllUsers_EmptyPage() {
            when(userRepository.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(Collections.emptyList()));

            Page<UserDto> result = userService.getAllUsers(PageRequest.of(0, 10));

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Update User")
    class UpdateUser {

        @Test
        @DisplayName("Should update name when provided")
        void updateUser_FullName_Success() {
            UserUpdateDto updateDto = UserUpdateDto.builder().firstName("New").lastName("Name").build();
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userRepository.save(user)).thenReturn(user);
            when(userMapper.toDto(user)).thenReturn(userDto);

            userService.updateUser(1L, updateDto);

            assertThat(user.getFirstName()).isEqualTo("New");
            assertThat(user.getLastName()).isEqualTo("Name");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Should not save when update DTO has no fields")
        void updateUser_EmptyDto_NoSave() {
            UserUpdateDto emptyDto = UserUpdateDto.builder().build();
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(userMapper.toDto(user)).thenReturn(userDto);

            userService.updateUser(1L, emptyDto);

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException for non-existent user")
        void updateUser_NotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.updateUser(99L, UserUpdateDto.builder().firstName("X").build()))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Delete User")
    class DeleteUser {

        @Test
        @DisplayName("Should delete user when found")
        void deleteUser_Success() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            userService.deleteUser(1L);

            verify(userRepository).delete(user);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException for non-existent user on delete")
        void deleteUser_NotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.deleteUser(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
