package com.carbonfootprint.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "point_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Long points;

    @Column(nullable = false)
    private String reason;

    @Column(name = "reference_id")
    private String referenceId; // E.g., goal_id or activity_id to prevent duplicate points

    @Column(name = "transaction_id", unique = true)
    private String transactionId;

    @Column(name = "action_type")
    private String actionType;

    @Column(name = "source_module")
    private String sourceModule;

    @Column(nullable = false)
    private String status = "AWARDED";

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
}
