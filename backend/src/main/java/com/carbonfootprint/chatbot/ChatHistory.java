package com.carbonfootprint.chatbot;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Stores recent chat messages to provide short-term conversational context.
 * Bounded history: older messages are not sent to the AI.
 */
@Entity
@Table(name = "chat_history", indexes = {
    @Index(name = "idx_chat_history_user", columnList = "user_email")
})
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false, length = 150)
    private String userEmail;

    /** "user" or "assistant" */
    @Column(name = "role", nullable = false, length = 20)
    private String role;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
