package com.carbonfootprint.chatbot;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Immutable audit trail for every chatbot interaction.
 *
 * NEVER stores: passwords, tokens, sensitive conversation content,
 * raw query text (unless a future privacy policy explicitly requires it).
 */
@Entity
@Table(name = "chat_audit_logs", indexes = {
    @Index(name = "idx_chat_audit_user", columnList = "user_email"),
    @Index(name = "idx_chat_audit_time", columnList = "created_at")
})
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Correlation ID — ties request log to response log */
    @Column(name = "request_id", nullable = false, length = 36)
    private String requestId;

    /** Resolved from JWT — NEVER from client input */
    @Column(name = "user_email", nullable = false, length = 150)
    private String userEmail;

    /** Comma-separated active scopes e.g. "FOOTPRINT,GOALS" */
    @Column(name = "data_scope", length = 200)
    private String dataScope;

    /** "GEMINI" or "LOCAL_FALLBACK" */
    @Column(name = "ai_provider", length = 50)
    private String aiProvider;

    /** "SUCCESS", "REJECTED_OUT_OF_SCOPE", "AI_UNAVAILABLE" */
    @Column(name = "response_status", length = 50)
    private String responseStatus;

    /** Response latency in milliseconds */
    @Column(name = "latency_ms")
    private Long latencyMs;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
