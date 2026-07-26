package com.carbonfootprint.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "yearly_leaderboard_history", indexes = {
    @Index(name = "idx_ylh_year", columnList = "year")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YearlyLeaderboardHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "user_rank", nullable = false)
    private Integer rank;

    @Column(name = "yearly_score", nullable = false)
    private Long yearlyScore;

    @Column(name = "carbon_saved", precision = 10, scale = 2)
    private BigDecimal carbonSaved;

    @Column(name = "goals_completed")
    private Integer goalsCompleted;

    @Column(name = "badge_points")
    private Long badgePoints;

    @Column(name = "award_type", length = 50)
    private String awardType;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
