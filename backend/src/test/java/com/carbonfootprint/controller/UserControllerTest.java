package com.carbonfootprint.controller;

import com.carbonfootprint.dto.UserCreateDto;
import com.carbonfootprint.dto.UserDto;
import com.carbonfootprint.dto.UserUpdateDto;
import com.carbonfootprint.service.UserService;
import com.carbonfootprint.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for pure controller logic tests
@DisplayName("UserController Unit Tests")
class UserControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private UserService userService;
    @MockBean private JwtService jwtService;
    @MockBean private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;
    @MockBean private com.carbonfootprint.repository.TokenRepository tokenRepository;

    private UserDto userDto;
    private UserCreateDto createDto;

    @BeforeEach
    void setUp() {
        userDto = UserDto.builder().id(1L).email("test@example.com").firstName("Test").lastName("User").username("test_user").build();
        createDto = UserCreateDto.builder().email("test@example.com").password("Pass@123").confirmPassword("Pass@123").firstName("Test").lastName("User").username("test_user").build();
    }

    @Test
    @DisplayName("POST /api/v1/users - Success")
    void createUser() throws Exception {
        when(userService.createUser(any(UserCreateDto.class))).thenReturn(userDto);

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("test@example.com"));
    }

    @Test
    @DisplayName("POST /api/v1/users - Validation Failure")
    void createUser_InvalidInput() throws Exception {
        UserCreateDto invalidDto = UserCreateDto.builder().email("invalid").build();

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/v1/users/{id} - Success")
    void getUserById() throws Exception {
        when(userService.getUserById(1L)).thenReturn(userDto);

        mockMvc.perform(get("/api/v1/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1L));
    }

    @Test
    @DisplayName("PUT /api/v1/users/{id} - Success")
    void updateUser() throws Exception {
        UserUpdateDto updateDto = UserUpdateDto.builder().fullName("Updated").build();
        UserDto updatedUser = UserDto.builder().id(1L).email("test@example.com").fullName("Updated").build();
        
        when(userService.updateUser(eq(1L), any(UserUpdateDto.class))).thenReturn(updatedUser);

        mockMvc.perform(put("/api/v1/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("Updated"));
    }
}
