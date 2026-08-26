package com.carbonfootprint.security;

import com.carbonfootprint.entity.Token;
import com.carbonfootprint.entity.TokenType;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.TokenRepository;
import com.carbonfootprint.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import jakarta.servlet.http.Cookie;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final TokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:${FRONTEND_URL:http://localhost:5173}}")
    private String frontendUrl;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        try {
            CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
            User user = oAuth2User.getUser();

            // Ensure managed User entity from current transaction
            User managedUser = userRepository.findById(user.getId())
                    .orElseGet(() -> userRepository.findByEmail(user.getEmail()).orElse(user));

            // Generate JWT token and refresh token
            String jwtToken = jwtService.generateToken(managedUser);
            String refreshToken = jwtService.generateRefreshToken(managedUser);

            // Revoke existing tokens and save new one
            revokeAllUserTokens(managedUser);
            saveUserToken(managedUser, jwtToken);

            // Redirect to frontend with token
            String targetUrl = determineTargetUrl(request, response, authentication, jwtToken, refreshToken);

            log.info("OAuth2 login successful for user: {}. Redirecting to: {}", managedUser.getEmail(), targetUrl);

            clearAuthenticationAttributes(request, response);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception e) {
            log.error("Critical error during OAuth2 authentication success processing: ", e);
            String errorMsg = URLEncoder.encode(e.getMessage() != null ? e.getMessage() : "OAuth authentication failed", StandardCharsets.UTF_8);
            String fallbackUrl = frontendUrl.replaceAll("/+$", "") + "/login?error=" + errorMsg;
            clearAuthenticationAttributes(request, response);
            getRedirectStrategy().sendRedirect(request, response, fallbackUrl);
        }
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
        if (uri == null || uri.trim().isEmpty()) {
            return false;
        }
        try {
            java.net.URI clientRedirectUri = java.net.URI.create(uri);
            String host = clientRedirectUri.getHost();
            if (host == null) {
                return false;
            }
            if ("localhost".equalsIgnoreCase(host) || "127.0.0.1".equalsIgnoreCase(host)) {
                return true;
            }
            if (host.toLowerCase().endsWith(".onrender.com") || host.toLowerCase().endsWith(".vercel.app") || host.toLowerCase().endsWith(".netlify.app")) {
                return true;
            }
            java.net.URI defaultUri = java.net.URI.create(frontendUrl);
            if (host.equalsIgnoreCase(defaultUri.getHost())) {
                return true;
            }
            String allowedOrigins = System.getenv("ALLOWED_ORIGINS");
            if (allowedOrigins != null && !allowedOrigins.trim().isEmpty()) {
                for (String allowed : allowedOrigins.split(",")) {
                    java.net.URI allowedUri = java.net.URI.create(allowed.trim());
                    if (host.equalsIgnoreCase(allowedUri.getHost())) {
                        return true;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse redirect URI: {}", uri, e);
        }
        return false;
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
        if (validUserTokens.isEmpty())
            return;
        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }

    protected void clearAuthenticationAttributes(HttpServletRequest request, HttpServletResponse response) {
        super.clearAuthenticationAttributes(request);
        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
    }
}
