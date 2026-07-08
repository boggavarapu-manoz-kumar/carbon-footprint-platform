USE carbon_db;

-- 1. Insert Base Roles if not exists
INSERT IGNORE INTO admin_roles (name, description) VALUES
('SUPER_ADMIN', 'Full system access, can manage admins'),
('ADMIN', 'Standard administrative access'),
('MODERATOR', 'Content and user moderation'),
('SUPPORT', 'Customer support read-only access'),
('AUDITOR', 'Compliance and audit log access');

-- 2. Insert the SUPER_ADMIN user
INSERT IGNORE INTO admin_users (id, email, password_hash, is_active, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'superadmin@carbonfootprint.com',
    '$2a$10$wN9P3P4oHn1I5I8W2S3iDeH9N5P3P4oHn1I5I8W2S3iDeH9N5P3P4', -- Encrypted 'admin123'
    1,
    NOW(),
    NOW()
);

-- Find the SUPER_ADMIN role ID
SET @roleId = (SELECT id FROM admin_roles WHERE name = 'SUPER_ADMIN' LIMIT 1);

-- Link them (using admin_id since that's what the DB has right now)
INSERT IGNORE INTO admin_user_roles (admin_id, role_id)
VALUES ('00000000-0000-0000-0000-000000000001', @roleId);

-- Wait, does it also have admin_user_id because Hibernate created it? Let's check!
