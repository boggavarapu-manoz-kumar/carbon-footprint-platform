package com.carbonfootprint.security.admin;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

@Service
public class AdminJwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    private static final String ISSUER = "carbon-platform-admin";
    private static final String AUDIENCE = "admin-portal";

    // In-memory map for Token Replay protection
    private final Map<String, Boolean> revokedTokens = new ConcurrentHashMap<>();

    public void revokeToken(String jti) {
        if (jti != null) {
            revokedTokens.put(jti, true);
        }
    }

    public boolean isTokenRevoked(String jti) {
        return jti != null && revokedTokens.containsKey(jti);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractSessionId(String token) {
        return extractClaim(token, claims -> claims.get("sid", Long.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateAdminToken(Map<String, Object> extraClaims, UserDetails userDetails, Long sessionId) {
        return buildToken(extraClaims, userDetails, jwtExpiration, sessionId);
    }

    public String generateAdminRefreshToken(UserDetails userDetails, Long sessionId) {
        return buildToken(new HashMap<>(), userDetails, refreshExpiration, sessionId);
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration, Long sessionId) {
        extraClaims.put("sid", sessionId);
        return Jwts
                .builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .id(UUID.randomUUID().toString())
                .issuer(ISSUER)
                .audience().add(AUDIENCE).and()
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), Jwts.SIG.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        final String issuer = extractClaim(token, Claims::getIssuer);
        final java.util.Set<String> audience = extractClaim(token, Claims::getAudience);

        return (username.equals(userDetails.getUsername())) 
                && !isTokenExpired(token)
                && ISSUER.equals(issuer)
                && audience.contains(AUDIENCE);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private javax.crypto.SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
