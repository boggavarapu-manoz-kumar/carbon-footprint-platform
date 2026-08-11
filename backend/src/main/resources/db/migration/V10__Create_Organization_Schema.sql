-- V10__Create_Organization_Schema.sql

CREATE TABLE organizations (
    id BIGSERIAL PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    organization_code VARCHAR(255) UNIQUE NOT NULL,
    industry VARCHAR(100),
    company_size VARCHAR(50),
    country VARCHAR(100),
    timezone VARCHAR(50),
    logo VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    owner_user_id BIGINT NOT NULL
);

CREATE TABLE organization_members (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    job_title VARCHAR(100),
    employee_id VARCHAR(100),
    joined_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_org_member_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_org_member_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_org_user UNIQUE (organization_id, user_id)
);

CREATE TABLE organization_invitations (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    job_title VARCHAR(100),
    employee_id VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_org_invite_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE organization_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    actor VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    old_value JSON,
    new_value JSON,
    ip_address VARCHAR(45),
    device_info VARCHAR(255),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_org_audit_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);
CREATE TABLE organization_settings (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL UNIQUE,
    allow_employee_invites BOOLEAN NOT NULL DEFAULT FALSE,
    require_sso BOOLEAN NOT NULL DEFAULT FALSE,
    default_department VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_org_settings_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Essential B-Tree Indexes for rapid multi-tenant queries
CREATE INDEX idx_org_member_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_member_user_id ON organization_members(user_id);
CREATE INDEX idx_org_member_status ON organization_members(status);
CREATE INDEX idx_org_invite_token ON organization_invitations(token);
CREATE INDEX idx_org_invite_org_id ON organization_invitations(organization_id);
CREATE INDEX idx_org_audit_org_id ON organization_audit_logs(organization_id);
