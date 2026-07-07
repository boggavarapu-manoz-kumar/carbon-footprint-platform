package com.carbonfootprint.entity.admin;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_device_tracking")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDeviceTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private AdminUser adminUser;

    @Column(name = "device_fingerprint", nullable = false, length = 255)
    private String deviceFingerprint;

    @Column(length = 100)
    private String os;

    @Column(length = 100)
    private String browser;

    @Column(name = "is_trusted", nullable = false)
    @Builder.Default
    private boolean isTrusted = false;

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
