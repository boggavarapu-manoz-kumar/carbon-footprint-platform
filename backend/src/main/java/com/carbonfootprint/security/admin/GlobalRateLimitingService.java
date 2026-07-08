package com.carbonfootprint.security.admin;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class GlobalRateLimitingService {

    // Login limits: strict to prevent brute-force (5 attempts per minute per IP)
    private final Cache<String, Bucket> loginBuckets = Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterAccess(Duration.ofMinutes(5))
            .build();

    // Global IP limits for admin APIs: burst protection (100 requests per minute per IP)
    private final Cache<String, Bucket> globalIpBuckets = Caffeine.newBuilder()
            .maximumSize(50_000)
            .expireAfterAccess(Duration.ofMinutes(5))
            .build();

    // Per-User limits: protect against compromised admin accounts (200 requests per minute per Admin ID)
    private final Cache<String, Bucket> userBuckets = Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterAccess(Duration.ofMinutes(5))
            .build();

    public Bucket resolveLoginBucket(String ipAddress) {
        return loginBuckets.get(ipAddress, key -> Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1))))
                .build());
    }

    public Bucket resolveGlobalIpBucket(String ipAddress) {
        return globalIpBuckets.get(ipAddress, key -> Bucket.builder()
                .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1))))
                .build());
    }

    public Bucket resolveUserBucket(String username) {
        return userBuckets.get(username, key -> Bucket.builder()
                .addLimit(Bandwidth.classic(200, Refill.intervally(200, Duration.ofMinutes(1))))
                .build());
    }
}
