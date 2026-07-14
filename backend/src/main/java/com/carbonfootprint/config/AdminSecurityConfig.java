package com.carbonfootprint.config;

import com.carbonfootprint.security.admin.AdminJwtAuthenticationFilter;
import com.carbonfootprint.security.admin.AdminUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminSecurityConfig {

    private final AdminUserDetailsService adminUserDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Bean(name = "adminAuthenticationProvider")
    public AuthenticationProvider adminAuthenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(adminUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean(name = "adminAuthenticationManager")
    public AuthenticationManager adminAuthenticationManager() {
        return new ProviderManager(adminAuthenticationProvider());
    }

    @Bean
    @org.springframework.core.annotation.Order(1)
    public org.springframework.security.web.SecurityFilterChain adminSecurityFilterChain(
            org.springframework.security.config.annotation.web.builders.HttpSecurity http,
            AdminJwtAuthenticationFilter adminJwtAuthFilter,
            com.carbonfootprint.security.admin.GlobalRateLimitFilter globalRateLimitFilter,
            com.carbonfootprint.security.JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
            SecurityConfig securityConfig) throws Exception {

        http
            .securityMatcher("/api/v1/admin/**")
            .cors(cors -> cors.configurationSource(securityConfig.corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/admin/auth/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "MODERATOR", "SUPPORT_TEAM", "AUDITOR")
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.STATELESS))
            .authenticationProvider(adminAuthenticationProvider())
            .addFilterBefore(globalRateLimitFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(adminJwtAuthFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
