package com.carbonfootprint.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "weekly_leaderboard_history", indexes = {
    @Index(name = "idx_wlh_week", columnList = "week_start_date, week_end_date")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyLeaderboardHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    @Column(name = "week_end_date", nullable = false)
    private LocalDate weekEndDate;

    @Column(name = "user_rank", nullable = false)
    private Integer rank;

    @Column(name = "weekly_score", nullable = false)
    private Long weeklyScore;

    @Column(name = "carbon_saved", precision = 10, scale = 2)
    private BigDecimal carbonSaved;

    @Column(name = "badges_earned")
    private Integer badgesEarned;

    @Column(length = 20)
    private String trend; // UP, DOWN, STABLE

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
