package com.carbonfootprint.security.admin;

/**
 * Enterprise-Grade RBAC Permission Constants.
 * Follows the Google Cloud IAM resource:action naming convention.
 * These constants should be used within @PreAuthorize tags to prevent hardcoding.
 */
public final class AdminPermissions {

    private AdminPermissions() {
        // Restrict instantiation
    }

    // Users
    public static final String USERS_VIEW = "users:view";
    public static final String USERS_CREATE = "users:create";
    public static final String USERS_UPDATE = "users:update";
    public static final String USERS_DELETE = "users:delete";
    public static final String USERS_EXPORT = "users:export";
    public static final String USERS_APPROVE = "users:approve";

    // Activities
    public static final String ACTIVITIES_VIEW = "activities:view";
    public static final String ACTIVITIES_CREATE = "activities:create";
    public static final String ACTIVITIES_UPDATE = "activities:update";
    public static final String ACTIVITIES_DELETE = "activities:delete";
    public static final String ACTIVITIES_EXPORT = "activities:export";
    public static final String ACTIVITIES_APPROVE = "activities:approve";

    // Analytics
    public static final String ANALYTICS_VIEW = "analytics:view";
    public static final String ANALYTICS_EXPORT = "analytics:export";

    // Settings
    public static final String SETTINGS_VIEW = "settings:view";
    public static final String SETTINGS_UPDATE = "settings:update";

    // Admin Management
    public static final String ADMINS_VIEW = "admins:view";
    public static final String ADMINS_CREATE = "admins:create";
    public static final String ADMINS_UPDATE = "admins:update";
    public static final String ADMINS_DELETE = "admins:delete";

    // Audit Logs
    public static final String AUDITLOGS_VIEW = "auditlogs:view";
    public static final String AUDITLOGS_EXPORT = "auditlogs:export";
}
