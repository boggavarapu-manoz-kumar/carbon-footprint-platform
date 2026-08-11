package com.carbonfootprint.chatbot;

import com.carbonfootprint.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatAuditService {

    private final ChatAuditRepository chatAuditRepository;

    /**
     * Logs the incoming request.
     * Starts a new transaction to ensure the log is saved even if the main request fails.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logRequest(User user, String requestId, String dataScope) {
        try {
            ChatAuditLog auditLog = ChatAuditLog.builder()
                    .requestId(requestId)
                    .userEmail(user.getEmail()) // Important: Never log the raw user ID or tokens
                    .dataScope(dataScope)
                    .build();
            
            chatAuditRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to log chat request audit for user {}", user.getEmail(), e);
            // We don't want audit failures to block the chat functionality entirely, 
            // but in a strict environment we might throw here. 
            // For now, logging the error is sufficient.
        }
    }

    /**
     * Updates the audit log with the response status and latency.
     * Uses REQUIRES_NEW to ensure the update commits even if the main transaction rolls back.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logResponse(String requestId, String status, String provider) {
        try {
            chatAuditRepository.findByRequestId(requestId).ifPresent(auditLog -> {
                Long latency = Duration.between(auditLog.getCreatedAt(), LocalDateTime.now()).toMillis();
                
                ChatAuditLog updatedLog = ChatAuditLog.builder()
                        .id(auditLog.getId()) // Retain ID to update
                        .requestId(auditLog.getRequestId())
                        .userEmail(auditLog.getUserEmail())
                        .dataScope(auditLog.getDataScope())
                        .createdAt(auditLog.getCreatedAt())
                        .aiProvider(provider)
                        .responseStatus(status)
                        .latencyMs(latency)
                        .build();
                        
                chatAuditRepository.save(updatedLog);
            });
        } catch (Exception e) {
            log.error("Failed to log chat response audit for request {}", requestId, e);
        }
    }
}
