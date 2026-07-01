package com.carbonfootprint.dto.auth;

import com.carbonfootprint.dto.UserDto;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AuthenticationResponse {
    String accessToken;
    String refreshToken;
    UserDto user;
}
