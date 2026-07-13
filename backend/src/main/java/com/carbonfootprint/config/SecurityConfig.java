package com.carbonfootprint.config;

import com.carbonfootprint.security.JwtAuthenticationEntryPoint;
import com.carbonfootprint.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import com.carbonfootprint.security.admin.GlobalRateLimitFilter;
import com.carbonfootprint.security.admin.AdminJwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.carbonfootprint.security.CustomOAuth2UserService;
import com.carbonfootprint.security.OAuth2AuthenticationSuccessHandler;
import com.carbonfootprint.security.OAuth2AuthenticationFailureHandler;
import com.carbonfootprint.security.HttpCookieOAuth2AuthorizationRequestRepository;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final LogoutHandler logoutHandler;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
    private final AdminJwtAuthenticationFilter adminJwtAuthFilter;
    private final GlobalRateLimitFilter globalRateLimitFilter;
    private final HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, ClientRegistrationRepository clientRegistrationRepository) throws Exception {
        
        // Use a customized request attribute handler to ensure CSRF works seamlessly with SPAs
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null);

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Disable CSRF as we use stateless JWT Bearer tokens in headers, not cookies.
            .csrf(csrf -> csrf.disable())
            
            // XSS & Clickjacking Protection: Strict HTTP Security Headers
            .headers(headers -> headers
                .xssProtection(xss -> xss.disable()) // Deprecated in favor of CSP
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-ancestors 'none'; form-action 'self';")
                )
                .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .preload(true)
                    .maxAgeInSeconds(31536000)
                )
            )

            .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**", "/api/v1/admin/auth/**", "/oauth2/**", "/login/oauth2/code/**", "/api/v1/users/check-username", "/api/v1/users/suggest-username", "/error").permitAll()
                .requestMatchers("/actuator/**").hasRole("SUPER_ADMIN")
                .requestMatchers("/api/v1/admin/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "MODERATOR", "SUPPORT_TEAM", "AUDITOR")
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(globalRateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(adminJwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, AdminJwtAuthenticationFilter.class)
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(authEndpoint -> authEndpoint
                    .baseUri("/oauth2/authorization")
                    .authorizationRequestResolver(authorizationRequestResolver(clientRegistrationRepository))
                    .authorizationRequestRepository(cookieAuthorizationRequestRepository)
                )
                .redirectionEndpoint(redirectionEndpoint -> redirectionEndpoint
                    .baseUri("/login/oauth2/code/*")
                )
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .successHandler(oAuth2AuthenticationSuccessHandler)
                .failureHandler(oAuth2AuthenticationFailureHandler)
            )

            .logout(logout -> logout
                .logoutUrl("/api/v1/auth/logout")
                .addLogoutHandler(logoutHandler)
                .logoutSuccessHandler((request, response, authentication) -> SecurityContextHolder.clearContext())
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Read from ENV, fallback to strict local defaults (DO NOT use '*')
        String allowedOrigins = System.getenv("ALLOWED_ORIGINS");
        if (allowedOrigins == null || allowedOrigins.trim().isEmpty()) {
            configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173", "http://localhost:5174"));
        } else {
            configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        }
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private OAuth2AuthorizationRequestResolver authorizationRequestResolver(ClientRegistrationRepository clientRegistrationRepository) {
        DefaultOAuth2AuthorizationRequestResolver authorizationRequestResolver =
                new DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository, "/oauth2/authorization");
        
        authorizationRequestResolver.setAuthorizationRequestCustomizer(customizer -> 
            customizer.additionalParameters(params -> params.put("prompt", "select_account"))
        );
        
        return authorizationRequestResolver;
    }
}
