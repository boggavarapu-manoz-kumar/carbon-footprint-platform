package com.carbonfootprint.security;

import com.carbonfootprint.entity.Token;
import com.carbonfootprint.entity.TokenType;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.TokenRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final TokenRepository tokenRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        User user = oAuth2User.getUser();

        // Generate JWT token and refresh token
        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        
        // Revoke existing tokens and save new one
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);

        // Redirect to frontend with token
        // In a real production app, this URL should be configured via application.yml
        String redirectUrl = "http://localhost:5173/oauth2/redirect?token=" + jwtToken + "&refreshToken=" + refreshToken;
        
        log.info("OAuth2 login successful for user: {}. Redirecting to frontend.", user.getEmail());
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private void saveUserToken(User user, String jwtToken) {
        Token token = Token.builder()
                .user(user)
                .token(jwtToken)
                .tokenType(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }

    private void revokeAllUserTokens(User user) {
        var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if (validUserTokens.isEmpty()) return;
        
        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }
}
