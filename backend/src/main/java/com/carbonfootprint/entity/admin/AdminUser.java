package com.carbonfootprint.entity.admin;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "admin_users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUser implements UserDetails, Serializable {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 60)
    @ToString.Exclude
    private String password;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "admin_user_roles",
        joinColumns = @JoinColumn(name = "admin_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<AdminRole> roles;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .flatMap(role -> role.getAuthorities().stream())
                .collect(Collectors.toSet());
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return isActive && deletedAt == null;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isActive && deletedAt == null;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return isActive && deletedAt == null;
    }

    @Override
    public boolean isEnabled() {
        return isActive && deletedAt == null;
    }
}
