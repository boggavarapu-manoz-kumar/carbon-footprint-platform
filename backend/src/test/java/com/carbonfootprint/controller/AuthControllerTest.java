package com.carbonfootprint.controller;

import com.carbonfootprint.dto.UserCreateDto;
import com.carbonfootprint.dto.auth.AuthenticationRequest;
import com.carbonfootprint.dto.auth.AuthenticationResponse;
import com.carbonfootprint.service.AuthService;
import com.carbonfootprint.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("AuthController Unit Tests")
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private AuthService authService;
    @MockBean private JwtService jwtService;
    @MockBean(name = "userDetailsService") private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;
    @MockBean private com.carbonfootprint.repository.TokenRepository tokenRepository;
    @MockBean private com.carbonfootprint.security.admin.AdminJwtService adminJwtService;
    @MockBean private com.carbonfootprint.security.admin.GlobalRateLimitingService globalRateLimitingService;
    @MockBean(name = "adminUserDetailsService") private com.carbonfootprint.security.admin.AdminUserDetailsService adminUserDetailsService;
    @MockBean private com.carbonfootprint.repository.admin.AdminSessionRepository adminSessionRepository;
    @MockBean private io.micrometer.core.instrument.MeterRegistry meterRegistry;

    @Test
    @DisplayName("POST /api/v1/auth/register - Success")
    void register() throws Exception {
        UserCreateDto request = UserCreateDto.builder().email("test@test.com").password("Pass@123").confirmPassword("Pass@123").firstName("name").lastName("last").username("test_user").build();
        AuthenticationResponse response = AuthenticationResponse.builder().accessToken("token").build();

        when(authService.register(any(UserCreateDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("token"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/authenticate - Success")
    void authenticate() throws Exception {
        AuthenticationRequest authRequest = AuthenticationRequest.builder()
                .loginIdentifier("test@example.com")
                .password("password123")
                .build();
        AuthenticationResponse response = AuthenticationResponse.builder().accessToken("token").build();

        when(authService.authenticate(any(AuthenticationRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/authenticate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("token"));
    }
}
