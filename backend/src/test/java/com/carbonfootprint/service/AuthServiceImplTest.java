package com.carbonfootprint.service;

import com.carbonfootprint.dto.UserCreateDto;
import com.carbonfootprint.dto.UserDto;
import com.carbonfootprint.dto.auth.AuthenticationRequest;
import com.carbonfootprint.dto.auth.AuthenticationResponse;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.exception.BadRequestException;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.mapper.UserMapper;
import com.carbonfootprint.repository.TokenRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.security.JwtService;
import com.carbonfootprint.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private TokenRepository tokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthServiceImpl authService;

    private UserCreateDto createDto;
    private User user;
    private UserDto userDto;

    @BeforeEach
    void setUp() {
        createDto = UserCreateDto.builder().email("test@example.com").password("pass").confirmPassword("pass").fullName("Test User").build();
        user = User.builder().id(1L).email("test@example.com").build();
        userDto = UserDto.builder().id(1L).email("test@example.com").build();
    }

    @Test
    void register_Success() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("pass")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(user)).thenReturn("jwtToken");
        when(jwtService.generateRefreshToken(user)).thenReturn("refreshToken");
        when(userMapper.toDto(user)).thenReturn(userDto);

        AuthenticationResponse response = authService.register(createDto);

        assertNotNull(response);
        assertEquals("jwtToken", response.getAccessToken());
        verify(tokenRepository).save(any());
    }

    @Test
    void register_EmailExists() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(createDto));
    }

    @Test
    void authenticate_Success() {
        AuthenticationRequest req = AuthenticationRequest.builder().email("test@example.com").password("pass").build();
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwtToken");
        when(jwtService.generateRefreshToken(user)).thenReturn("refreshToken");
        when(userMapper.toDto(user)).thenReturn(userDto);

        AuthenticationResponse response = authService.authenticate(req);

        assertNotNull(response);
        assertEquals("jwtToken", response.getAccessToken());
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void authenticate_UserNotFound() {
        AuthenticationRequest req = AuthenticationRequest.builder().email("notfound@example.com").password("pass").build();
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.authenticate(req));
    }
}
