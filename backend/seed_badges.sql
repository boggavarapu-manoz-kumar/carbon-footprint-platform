-- Insert realistic badges for CarbonSync
INSERT INTO badges (name, description, category, badge_type, rule_type, rule_target, criteria, difficulty, points, xp, icon, image_url, color, level, visibility, status, created_at)
VALUES 
('Eco Starter', 'Logged your very first sustainable activity. Welcome to the journey!', 'GENERAL', 'ACHIEVEMENT', 'ACTIVITY_COUNT', 1, '{}', 'BEGINNER', 50, 50, 'Star', 'https://cdn-icons-png.flaticon.com/512/763/763354.png', '#10B981', 1, 'PUBLIC', 'ACTIVE', NOW()),

('Transit Hero', 'Logged 10 public transit or carpooling activities.', 'TRANSPORT', 'MILESTONE', 'ACTIVITY_COUNT', 10, '{"activityType": "PUBLIC_TRANSIT"}', 'INTERMEDIATE', 200, 200, 'Zap', 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png', '#3B82F6', 2, 'PUBLIC', 'ACTIVE', NOW()),

('Recycling Champion', 'Consistently recycled for 30 days straight.', 'WASTE', 'STREAK', 'STREAK', 30, '{"activityType": "RECYCLING"}', 'ADVANCED', 500, 500, 'Award', 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', '#F59E0B', 3, 'PUBLIC', 'ACTIVE', NOW()),

('Carbon Neutralizer', 'Offset or saved 500kg of CO2 emissions.', 'ENERGY', 'MILESTONE', 'CARBON_REDUCED', 500, '{}', 'EXPERT', 1000, 1000, 'Shield', 'https://cdn-icons-png.flaticon.com/512/2800/2800160.png', '#8B5CF6', 4, 'PUBLIC', 'ACTIVE', NOW()),

('Plant Whisperer', 'Planted 5 trees or maintained a community garden.', 'COMMUNITY', 'ACHIEVEMENT', 'ACTIVITY_COUNT', 5, '{"activityType": "TREE_PLANTING"}', 'INTERMEDIATE', 300, 300, 'Leaf', 'https://cdn-icons-png.flaticon.com/512/2619/2619073.png', '#22C55E', 2, 'PUBLIC', 'ACTIVE', NOW()),

('Legendary Earth Saver', 'Saved over 5000kg of CO2 and reached Level 50.', 'GENERAL', 'MILESTONE', 'CARBON_REDUCED', 5000, '{}', 'LEGENDARY', 5000, 5000, 'Crown', 'https://cdn-icons-png.flaticon.com/512/5551/5551390.png', '#F43F5E', 5, 'PUBLIC', 'ACTIVE', NOW());
