package com.carbonfootprint.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", length = 50)
    private MilestoneRuleType ruleType;

    @Column(name = "rule_target")
    private Integer ruleTarget;

    @Column(length = 255)
    private String criteria;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(length = 50)
    private String icon;

    @Column(length = 20)
    private String color;

    @Column(length = 50)
    private String category;

    @Column(length = 50)
    private String difficulty;

    @Column
    private Long points;

    @Column
    private Long xp;

    @Column
    private Integer level;

    @Column(name = "badge_type", length = 50)
    private String badgeType;

    @Column(length = 20)
    private String visibility;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BadgeStatus status = BadgeStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
