package com.carbonfootprint.security.admin;

import com.carbonfootprint.security.JwtService;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class GlobalRateLimitFilter extends OncePerRequestFilter {

    private final GlobalRateLimitingService rateLimitingService;
    private final JwtService jwtService;
    private final MeterRegistry meterRegistry;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        String path = request.getRequestURI();
        
        // Skip OPTIONS requests for CORS preflight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Only apply to /api/v1 endpoints
        if (!path.startsWith("/api/v1")) {
            filterChain.doFilter(request, response);
            return;
        }

        String ipAddress = getClientIpAddress(request);
        
        // 1. Check Login Limits (for both regular users and admins)
        if (path.equals("/api/v1/auth/authenticate") || path.equals("/api/v1/auth/register") || path.equals("/api/v1/admin/auth/login") || path.equals("/api/v1/auth/forgot-password")) {
            Bucket loginBucket = rateLimitingService.resolveLoginBucket(ipAddress);
            ConsumptionProbe probe = loginBucket.tryConsumeAndReturnRemaining(1);
            if (!probe.isConsumed()) {
                rejectRequest(response, "Authentication rate limit exceeded. Try again later.");
                meterRegistry.counter("rate.limit.rejected", "type", "login", "ip", ipAddress).increment();
                return;
            }
        } else {
            // 2. Global IP Limits for all APIs
            Bucket globalIpBucket = rateLimitingService.resolveGlobalIpBucket(ipAddress);
            ConsumptionProbe ipProbe = globalIpBucket.tryConsumeAndReturnRemaining(1);
            if (!ipProbe.isConsumed()) {
                rejectRequest(response, "Global IP rate limit exceeded for APIs.");
                meterRegistry.counter("rate.limit.rejected", "type", "ip", "ip", ipAddress).increment();
                return;
            }

            // 3. Per-User Limits (if authenticated)
            String jwt = extractJwtFromRequest(request);
            if (StringUtils.hasText(jwt)) {
                try {
                    String username = jwtService.extractUsername(jwt);
                    if (username != null) {
                        Bucket userBucket = rateLimitingService.resolveUserBucket(username);
                        ConsumptionProbe userProbe = userBucket.tryConsumeAndReturnRemaining(1);
                        if (!userProbe.isConsumed()) {
                            rejectRequest(response, "User rate limit exceeded for admin APIs.");
                            meterRegistry.counter("rate.limit.rejected", "type", "user", "username", username).increment();
                            return;
                        }
                    }
                } catch (Exception e) {
                    // Ignore JWT extraction errors here; the actual JwtAuthenticationFilter will handle invalid tokens.
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private void rejectRequest(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.getWriter().write(String.format("{\"error\": \"Too Many Requests\", \"message\": \"%s\"}", message));
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || !xfHeader.contains(request.getRemoteAddr())) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
    
    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
