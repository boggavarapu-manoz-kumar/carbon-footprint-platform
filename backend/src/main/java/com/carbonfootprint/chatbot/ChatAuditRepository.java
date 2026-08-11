package com.carbonfootprint.chatbot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatAuditRepository extends JpaRepository<ChatAuditLog, Long> {
    Optional<ChatAuditLog> findByRequestId(String requestId);
}
