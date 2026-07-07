package com.carbonfootprint.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.carbonfootprint.entity.Permission.*;

@RequiredArgsConstructor
public enum Role {

    USER(Set.of(USER_BASIC)),
    
    ADMIN(Set.of(
            USER_READ,
            USER_WRITE,
            SYS_READ,
            SYS_WRITE
    )),
    
    SUPER_ADMIN(Set.of(
            ADMIN_READ,
            ADMIN_WRITE,
            USER_READ,
            USER_WRITE,
            SYS_READ,
            SYS_WRITE,
            AUDIT_READ
    )),
    
    MODERATOR(Set.of(
            USER_READ,
            ACTIVITY_READ,
            ACTIVITY_WRITE
    )),
    
    SUPPORT_TEAM(Set.of(
            USER_READ,
            SUPPORT_ACTIONS
    )),
    
    AUDITOR(Set.of(
            USER_READ,
            SYS_READ,
            AUDIT_READ
    ));

    @Getter
    private final Set<Permission> permissions;

    private List<SimpleGrantedAuthority> cachedAuthorities;

    public List<SimpleGrantedAuthority> getAuthorities() {
        if (cachedAuthorities == null) {
            var authorities = getPermissions()
                    .stream()
                    .map(permission -> new SimpleGrantedAuthority(permission.getPermission()))
                    .collect(Collectors.toList());
            authorities.add(new SimpleGrantedAuthority("ROLE_" + this.name()));
            cachedAuthorities = Collections.unmodifiableList(authorities);
        }
        return cachedAuthorities;
    }
}
