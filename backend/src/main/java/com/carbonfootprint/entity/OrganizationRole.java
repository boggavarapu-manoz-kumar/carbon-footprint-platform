package com.carbonfootprint.entity;

import java.util.Set;

public enum OrganizationRole {
    ORGANIZATION_OWNER(Set.of(
            OrganizationPermission.ORGANIZATION_VIEW,
            OrganizationPermission.ORGANIZATION_UPDATE,
            OrganizationPermission.MEMBERS_VIEW,
            OrganizationPermission.MEMBERS_INVITE,
            OrganizationPermission.MEMBERS_UPDATE,
            OrganizationPermission.MEMBERS_REMOVE,
            OrganizationPermission.MEMBERS_SUSPEND,
            OrganizationPermission.ANALYTICS_VIEW,
            OrganizationPermission.REPORTS_VIEW,
            OrganizationPermission.SETTINGS_VIEW,
            OrganizationPermission.SETTINGS_UPDATE
    )),
    ORGANIZATION_ADMIN(Set.of(
            OrganizationPermission.ORGANIZATION_VIEW,
            OrganizationPermission.ORGANIZATION_UPDATE,
            OrganizationPermission.MEMBERS_VIEW,
            OrganizationPermission.MEMBERS_INVITE,
            OrganizationPermission.MEMBERS_UPDATE,
            OrganizationPermission.MEMBERS_REMOVE,
            OrganizationPermission.MEMBERS_SUSPEND,
            OrganizationPermission.ANALYTICS_VIEW,
            OrganizationPermission.REPORTS_VIEW,
            OrganizationPermission.SETTINGS_VIEW,
            OrganizationPermission.SETTINGS_UPDATE
    )),
    ORGANIZATION_MANAGER(Set.of(
            OrganizationPermission.ORGANIZATION_VIEW,
            OrganizationPermission.MEMBERS_VIEW,
            OrganizationPermission.MEMBERS_INVITE,
            OrganizationPermission.ANALYTICS_VIEW,
            OrganizationPermission.REPORTS_VIEW,
            OrganizationPermission.SETTINGS_VIEW
    )),
    EMPLOYEE(Set.of(
            OrganizationPermission.ORGANIZATION_VIEW
    ));

    private final Set<OrganizationPermission> permissions;

    OrganizationRole(Set<OrganizationPermission> permissions) {
        this.permissions = permissions;
    }

    public Set<OrganizationPermission> getPermissions() {
        return permissions;
    }

    public boolean hasPermission(OrganizationPermission permission) {
        return permissions.contains(permission);
    }
}
