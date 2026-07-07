package com.carbonfootprint.repository.admin;

import com.carbonfootprint.entity.admin.AdminSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminSessionRepository extends JpaRepository<AdminSession, Long> {
    Optional<AdminSession> findByAccessTokenAndIsRevokedFalse(String accessToken);
    Optional<AdminSession> findByRefreshTokenAndIsRevokedFalse(String refreshToken);
}
