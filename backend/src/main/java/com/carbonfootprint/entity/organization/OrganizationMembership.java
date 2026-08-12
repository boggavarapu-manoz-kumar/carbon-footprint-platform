package com.carbonfootprint.entity.organization;

import com.carbonfootprint.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "organization_memberships",
    uniqueConstraints = @UniqueConstraint(columnNames = {"organization_id", "user_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private OrganizationRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private MembershipStatus status;

    private String department;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "employee_id")
    private String employeeId;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
