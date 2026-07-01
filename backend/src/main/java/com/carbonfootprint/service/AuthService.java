package com.carbonfootprint.service;

import com.carbonfootprint.dto.UserCreateDto;
import com.carbonfootprint.dto.auth.AuthenticationRequest;
import com.carbonfootprint.dto.auth.AuthenticationResponse;

public interface AuthService {
    AuthenticationResponse register(UserCreateDto request);
    AuthenticationResponse authenticate(AuthenticationRequest request);
}
