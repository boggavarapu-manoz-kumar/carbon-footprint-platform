package com.carbonfootprint.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "organizations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 100)
    private String industry;

    @Column(name = "organization_code", unique = true, length = 50)
    private String organizationCode;

    @Column(name = "company_size", length = 50)
    private String companySize;

    @Column(length = 100)
    private String country;

    @Column(length = 100)
    private String timezone;

    @Column(columnDefinition="LONGTEXT")
    private String logo;

    @Column(length = 255)
    private String website;

    @Column(length = 50)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, SUSPENDED, PENDING

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
