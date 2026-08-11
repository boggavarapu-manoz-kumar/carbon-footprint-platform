package com.carbonfootprint.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "organization_invitations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, unique = true, length = 100)
    private String token;

    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @Column(length = 100)
    private String department;

    @Column(name = "job_title", length = 100)
    private String jobTitle;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING"; // PENDING, ACCEPTED, EXPIRED, REVOKED, DECLINED

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    @Builder.Default
    private OrganizationRole role = OrganizationRole.EMPLOYEE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}
