package com.carbonfootprint.security.admin;

import com.carbonfootprint.repository.admin.AdminSessionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminJwtAuthenticationFilter extends OncePerRequestFilter {

    private final AdminJwtService jwtService;
    private final AdminUserDetailsService userDetailsService;
    private final AdminSessionRepository sessionRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String requestURI = request.getRequestURI();
        
        // Only intercept requests directed to the admin panel
        if (!requestURI.startsWith("/api/v1/admin/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Exclude authentication endpoints
        if (requestURI.contains("/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String authHeader = request.getHeader("Authorization");
            final String jwt;
            final String userEmail;

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            jwt = authHeader.substring(7);
            
            try {
                userEmail = jwtService.extractUsername(jwt);
                
                if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                    // Verify Token mathematically
                    if (jwtService.isTokenValid(jwt, userDetails)) {
                        
                        // Verify Device Fingerprint (Session Hijacking Protection)
                        String tokenIpHash = jwtService.extractClaim(jwt, claims -> claims.get("ip_hash", String.class));
                        String tokenUaHash = jwtService.extractClaim(jwt, claims -> claims.get("ua_hash", String.class));
                        
                        String currentIpHash = hashFingerprint(getClientIp(request));
                        String currentUaHash = hashFingerprint(request.getHeader("User-Agent"));

                        if (tokenIpHash != null && tokenUaHash != null && 
                           (!tokenIpHash.equals(currentIpHash) || !tokenUaHash.equals(currentUaHash))) {
                            log.error("SESSION HIJACKING ATTEMPT DETECTED! IP or User-Agent mismatch for token: {}", jwt);
                            throw new SecurityException("Token fingerprint mismatch");
                        }

                        // Verify Token Replay (jti)
                        String jti = jwtService.extractClaim(jwt, io.jsonwebtoken.Claims::getId);
                        if (jwtService.isTokenRevoked(jti)) {
                            log.error("TOKEN REPLAY ATTEMPT DETECTED! Revoked JTI reused: {}", jti);
                            throw new SecurityException("Token has been revoked");
                        }
                        
                        // Verify Session is active in DB
                        var isSessionValid = sessionRepository.findByAccessTokenAndIsRevokedFalse(jwt)
                                .isPresent();
                                
                        if (isSessionValid) {
                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            org.springframework.security.core.context.SecurityContext context = SecurityContextHolder.createEmptyContext();
                            context.setAuthentication(authToken);
                            SecurityContextHolder.setContext(context);
                        }
                    }
                }
            } catch (Exception ex) {
                log.warn("Admin JWT Authentication Failed: {}", ex.getMessage());
            }

            filterChain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    private String hashFingerprint(String input) {
        if (input == null) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(input.hashCode());
        }
    }
}
