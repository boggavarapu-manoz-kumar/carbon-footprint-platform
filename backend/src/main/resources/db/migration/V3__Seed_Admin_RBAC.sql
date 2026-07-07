-- ==========================================
-- V3__Seed_Admin_RBAC.sql
-- ==========================================

-- 1. Insert Granular Permissions (Google Cloud IAM Style)
INSERT INTO admin_permissions (name, description) VALUES
-- Users
('users:view', 'View standard user details'),
('users:create', 'Create new standard users'),
('users:update', 'Update standard user profiles'),
('users:delete', 'Delete standard users'),
('users:export', 'Export user data'),
('users:approve', 'Approve pending user accounts'),

-- Activities
('activities:view', 'View activities'),
('activities:create', 'Create activities'),
('activities:update', 'Update activities'),
('activities:delete', 'Delete activities'),
('activities:export', 'Export activity data'),
('activities:approve', 'Approve pending activities'),

-- Analytics
('analytics:view', 'View platform analytics'),
('analytics:export', 'Export analytics reports'),

-- Settings
('settings:view', 'View platform settings'),
('settings:update', 'Update platform settings'),

-- Admin Management
('admins:view', 'View administrator accounts'),
('admins:create', 'Create administrator accounts'),
('admins:update', 'Update administrator accounts'),
('admins:delete', 'Delete administrator accounts'),

-- Audit Logs
('auditlogs:view', 'View system audit logs'),
('auditlogs:export', 'Export system audit logs');

-- 2. Insert Base Roles
INSERT INTO admin_roles (name, description) VALUES
('SUPER_ADMIN', 'Full system access, can manage admins'),
('ADMIN', 'Standard administrative access'),
('MODERATOR', 'Content and user moderation'),
('SUPPORT', 'Customer support read-only access'),
('AUDITOR', 'Compliance and audit log access');

-- 3. Map Permissions to Roles

-- SUPER_ADMIN: Gets ALL permissions
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r, admin_permissions p
WHERE r.name = 'SUPER_ADMIN';

-- ADMIN: Gets standard permissions (no admin management, no audit logs)
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r, admin_permissions p
WHERE r.name = 'ADMIN'
AND p.name NOT LIKE 'admins:%'
AND p.name NOT LIKE 'auditlogs:%';

-- MODERATOR: Content-focused (view, update, approve for users/activities)
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r, admin_permissions p
WHERE r.name = 'MODERATOR'
AND p.name IN (
    'users:view', 'users:update', 'users:approve',
    'activities:view', 'activities:update', 'activities:approve'
);

-- SUPPORT: Read-only access to users and activities
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r, admin_permissions p
WHERE r.name = 'SUPPORT'
AND p.name IN ('users:view', 'activities:view');

-- AUDITOR: Read-only access to analytics and audit logs
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r, admin_permissions p
WHERE r.name = 'AUDITOR'
AND p.name IN ('analytics:view', 'analytics:export', 'auditlogs:view', 'auditlogs:export');

-- 4. Create Initial Default Super Admin Account (Password: admin123)
-- Using a fixed UUID for consistency, or generate dynamically. For SQL standard, we generate it.
INSERT INTO admin_users (id, role_id, email, password_hash, status)
SELECT 
    '00000000-0000-0000-0000-000000000001', 
    id, 
    'superadmin@carbonfootprint.com', 
    '$2a$10$wN9P3P4oHn1I5I8W2S3iDeH9N5P3P4oHn1I5I8W2S3iDeH9N5P3P4', -- Encrypted 'admin123'
    'ACTIVE'
FROM admin_roles WHERE name = 'SUPER_ADMIN';
