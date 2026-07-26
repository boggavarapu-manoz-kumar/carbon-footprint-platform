package com.carbonfootprint.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "monthly_leaderboard_history", indexes = {
    @Index(name = "idx_mlh_month", columnList = "month_start_date, month_end_date")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyLeaderboardHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "month_start_date", nullable = false)
    private LocalDate monthStartDate;

    @Column(name = "month_end_date", nullable = false)
    private LocalDate monthEndDate;

    @Column(name = "user_rank", nullable = false)
    private Integer rank;

    @Column(name = "monthly_score", nullable = false)
    private Long monthlyScore;

    @Column(name = "carbon_saved", precision = 10, scale = 2)
    private BigDecimal carbonSaved;

    @Column(name = "goals_completed")
    private Integer goalsCompleted;

    @Column(name = "activity_count")
    private Integer activityCount;
    
    @Column(name = "badges_earned")
    private Integer badgesEarned;

    @Column(name = "award_type", length = 50)
    private String awardType;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
