package com.carbonfootprint.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum Permission {

    ADMIN_READ("admin:read"),
    ADMIN_WRITE("admin:write"),
    USER_READ("user:read"),
    USER_WRITE("user:write"),
    SYS_READ("sys:read"),
    SYS_WRITE("sys:write"),
    AUDIT_READ("audit:read"),
    ACTIVITY_READ("activity:read"),
    ACTIVITY_WRITE("activity:write"),
    SUPPORT_ACTIONS("support:actions"),
    USER_BASIC("user:basic");

    @Getter
    private final String permission;
}
