package com.carbonfootprint.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "recommendation_cache", indexes = {
    @Index(name = "idx_rec_cache_user_category", columnList = "user_id, category, timeframe")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationCache {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "category", nullable = false)
    private String category;

    // DAILY, WEEKLY, MONTHLY, YEARLY
    @Column(name = "timeframe", nullable = false)
    private String timeframe;

    @Column(name = "tip_text", columnDefinition = "TEXT")
    private String tipText;

    @Column(name = "last_activity_date")
    private LocalDateTime lastActivityDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
