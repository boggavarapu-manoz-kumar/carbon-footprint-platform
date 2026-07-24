package com.carbonfootprint.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "to_email", nullable = false)
    private String toEmail;

    @Column(nullable = false)
    private String subject;

    @Column(name = "template_name", nullable = false)
    private String templateName;

    @Column(name = "status", nullable = false)
    private String status; // "SENT", "FAILED"

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "goal_id")
    private Long goalId;

    @Column(name = "payload_data", columnDefinition = "TEXT")
    private String payloadData; // JSON representation of the template context

    @Column(name = "sent_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime sentAt = LocalDateTime.now();

    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private Integer retryCount = 0;

    @Column(name = "next_retry_at")
    private LocalDateTime nextRetryAt;

    @Column(name = "tracking_id", unique = true)
    private String trackingId;

    @Column(name = "opened", nullable = false)
    @Builder.Default
    private boolean opened = false;

    @Column(name = "clicked", nullable = false)
    @Builder.Default
    private boolean clicked = false;
}
