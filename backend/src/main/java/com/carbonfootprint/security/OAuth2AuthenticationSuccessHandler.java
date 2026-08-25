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
import org.springframework.web.util.UriComponentsBuilder;
import jakarta.servlet.http.Cookie;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final TokenRepository tokenRepository;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:5174}")
    private String frontendUrl;

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
        String targetUrl = determineTargetUrl(request, response, authentication, jwtToken, refreshToken);
        
        log.info("OAuth2 login successful for user: {}. Redirecting to: {}", user.getEmail(), targetUrl);
        
        clearAuthenticationAttributes(request, response);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication, String jwtToken, String refreshToken) {
        String targetUrl = frontendUrl; // default

        Cookie redirectUriCookie = HttpCookieOAuth2AuthorizationRequestRepository.getCookie(request, HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME);
        if (redirectUriCookie != null && redirectUriCookie.getValue() != null && !redirectUriCookie.getValue().isEmpty()) {
            String candidate = redirectUriCookie.getValue();
            if (isAuthorizedRedirectUri(candidate)) {
                targetUrl = candidate;
            } else {
                log.warn("Unauthorized redirect URI rejected: {}", candidate);
            }
        }

        return UriComponentsBuilder.fromUriString(targetUrl)
                .path("/oauth2/redirect")
                .queryParam("token", jwtToken)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();
    }

    private boolean isAuthorizedRedirectUri(String uri) {
        try {
            java.net.URI clientRedirectUri = java.net.URI.create(uri);
            java.net.URI defaultUri = java.net.URI.create(frontendUrl);
            if (clientRedirectUri.getHost() != null && clientRedirectUri.getHost().equalsIgnoreCase(defaultUri.getHost())
                    && clientRedirectUri.getPort() == defaultUri.getPort()) {
                return true;
            }
            // Allow localhost origins in development / testing
            if ("localhost".equalsIgnoreCase(clientRedirectUri.getHost()) || "127.0.0.1".equalsIgnoreCase(clientRedirectUri.getHost())) {
                return true;
            }
            String allowedOrigins = System.getenv("ALLOWED_ORIGINS");
            if (allowedOrigins != null && !allowedOrigins.trim().isEmpty()) {
                for (String allowed : allowedOrigins.split(",")) {
                    java.net.URI allowedUri = java.net.URI.create(allowed.trim());
                    if (clientRedirectUri.getHost() != null && clientRedirectUri.getHost().equalsIgnoreCase(allowedUri.getHost())
                            && clientRedirectUri.getPort() == allowedUri.getPort()) {
                        return true;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse redirect URI: {}", uri, e);
        }
        return false;
    }

    protected void clearAuthenticationAttributes(HttpServletRequest request, HttpServletResponse response) {
        super.clearAuthenticationAttributes(request);
        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
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
