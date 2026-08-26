package com.carbonfootprint.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Value("${app.frontend.url:${FRONTEND_URL:http://localhost:5173}}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        
        log.error("OAuth2 authentication failure intercepted: {}", exception.getMessage(), exception);
        
        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
        
        String errorMsg = URLEncoder.encode(exception.getLocalizedMessage() != null ? exception.getLocalizedMessage() : "Google authentication failed", StandardCharsets.UTF_8);
        String redirectUrl = frontendUrl.replaceAll("/+$", "") + "/login?error=" + errorMsg;
        
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
