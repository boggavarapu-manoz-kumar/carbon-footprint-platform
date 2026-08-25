package com.carbonfootprint.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_sustainability_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSustainabilityProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "total_points", nullable = false)
    @Builder.Default
    private Long totalPoints = 0L;

    @Column(name = "total_xp", nullable = false)
    @Builder.Default
    private Long totalXp = 0L;

    @Column(name = "current_level", nullable = false)
    @Builder.Default
    private String currentLevel = "Eco Beginner";

    @Column(name = "highest_streak")
    @Builder.Default
    private Integer highestStreak = 0;

    @Column(name = "adopted_recommendations_count")
    @Builder.Default
    private Integer adoptedRecommendationsCount = 0;

    @Column(name = "current_streak", nullable = false)
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    @Builder.Default
    private Integer longestStreak = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "total_carbon_saved", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalCarbonSaved = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getTotalPoints() {
        return totalPoints != null ? totalPoints : 0L;
    }

    public Long getTotalXp() {
        return totalXp != null ? totalXp : 0L;
    }

    public Integer getCurrentStreak() {
        return currentStreak != null ? currentStreak : 0;
    }

    public Integer getLongestStreak() {
        return longestStreak != null ? longestStreak : 0;
    }

    public Integer getHighestStreak() {
        return highestStreak != null ? highestStreak : 0;
    }

    public Integer getAdoptedRecommendationsCount() {
        return adoptedRecommendationsCount != null ? adoptedRecommendationsCount : 0;
    }

    public BigDecimal getTotalCarbonSaved() {
        return totalCarbonSaved != null ? totalCarbonSaved : BigDecimal.ZERO;
    }

    public String getCurrentLevel() {
        return currentLevel != null ? currentLevel : "Eco Beginner";
    }
}
