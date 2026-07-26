-- Seed Enterprise Gamification Badges
-- Using clear rules mapped to the current Gamification engine capabilities.

-- 🌱 First Step: First activity logged
INSERT INTO badges (name, description, rule_type, rule_target, criteria, image_url, icon, color, category, difficulty, points, xp, level, badge_type, visibility, status, created_at)
VALUES ('First Step', 'First activity logged', 'ACTIVITY_COUNT', 1, 'Log your first activity', 'https://cdn-icons-png.flaticon.com/512/2928/2928929.png', 'FaSeedling', '#4CAF50', 'General', 'COMMON', 10, 100, 1, 'MILESTONE', 'PUBLIC', 'ACTIVE', NOW());

-- 🎯 Goal Setter: First goal created
INSERT INTO badges (name, description, rule_type, rule_target, criteria, image_url, icon, color, category, difficulty, points, xp, level, badge_type, visibility, status, created_at)
VALUES ('Goal Setter', 'First goal created', 'GOAL_CREATED', 1, 'Create your first goal', 'https://cdn-icons-png.flaticon.com/512/1004/1004018.png', 'FaBullseye', '#FF9800', 'General', 'COMMON', 15, 150, 1, 'MILESTONE', 'PUBLIC', 'ACTIVE', NOW());

-- 🏆 Goal Achiever: First goal completed
INSERT INTO badges (name, description, rule_type, rule_target, criteria, image_url, icon, color, category, difficulty, points, xp, level, badge_type, visibility, status, created_at)
VALUES ('Goal Achiever', 'First goal completed', 'GOAL_COMPLETED', 1, 'Complete your first goal', 'https://cdn-icons-png.flaticon.com/512/3176/3176294.png', 'FaTrophy', '#FFD700', 'General', 'COMMON', 25, 250, 1, 'MILESTONE', 'PUBLIC', 'ACTIVE', NOW());

-- 🔥 7-Day Streak: Activity logged for 7 consecutive days
INSERT INTO badges (name, description, rule_type, rule_target, criteria, image_url, icon, color, category, difficulty, points, xp, level, badge_type, visibility, status, created_at)
VALUES ('7-Day Streak', 'Activity logged for 7 consecutive days', 'STREAK', 7, 'Maintain a 7 day streak', 'https://cdn-icons-png.flaticon.com/512/4334/4334200.png', 'FaFire', '#F44336', 'General', 'RARE', 50, 500, 2, 'MILESTONE', 'PUBLIC', 'ACTIVE', NOW());

-- 💎 30-Day Streak: Activity logged for 30 consecutive days
INSERT INTO badges (name, description, rule_type, rule_target, criteria, image_url, icon, color, category, difficulty, points, xp, level, badge_type, visibility, status, created_at)
VALUES ('30-Day Streak', 'Activity logged for 30 consecutive days', 'STREAK', 30, 'Maintain a 30 day streak', 'https://cdn-icons-png.flaticon.com/512/3135/3135695.png', 'FaGem', '#00BCD4', 'General', 'EPIC', 100, 1000, 3, 'MILESTONE', 'PUBLIC', 'ACTIVE', NOW());

-- 🚗 Transport Saver: Consistently logged transport activities
INSERT INTO badges (name, description, rule_type, rule_target, criteria, image_url, icon, color, category, difficulty, points, xp, level, badge_type, visibility, status, created_at)
VALUES ('Transport Saver', 'Consistently logged transport activities', 'ACTIVITY_COUNT', 10, 'Log 10 Transport activities', 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', 'FaCar', '#2196F3', 'Transport', 'RARE', 50, 500, 2, 'CATEGORY', 'PUBLIC', 'ACTIVE', NOW());

-- ⚡ Energy Guardian: Consistently logged energy activities
INSERT INTO badges (name, description, rule_type, rule_target, criteria, image_url, icon, color, category, difficulty, points, xp, level, badge_type, visibility, status, created_at)
VALUES ('Energy Guardian', 'Consistently logged energy activities', 'ACTIVITY_COUNT', 10, 'Log 10 Energy activities', 'https://cdn-icons-png.flaticon.com/512/2933/2933221.png', 'FaBolt', '#FFC107', 'Energy', 'RARE', 50, 500, 2, 'CATEGORY', 'PUBLIC', 'ACTIVE', NOW());

-- 🥗 Green Plate: Consistently logged food activities
INSERT INTO badges (name, description, rule_type, rule_target, criteria, image_url, icon, color, category, difficulty, points, xp, level, badge_type, visibility, status, created_at)
VALUES ('Green Plate', 'Consistently logged food activities', 'ACTIVITY_COUNT', 10, 'Log 10 Food activities', 'https://cdn-icons-png.flaticon.com/512/3082/3082025.png', 'FaLeaf', '#4CAF50', 'Food', 'RARE', 50, 500, 2, 'CATEGORY', 'PUBLIC', 'ACTIVE', NOW());

-- 🛍 Conscious Shopper: Consistently logged shopping activities
INSERT INTO badges (name, description, rule_type, rule_target, criteria, image_url, icon, color, category, difficulty, points, xp, level, badge_type, visibility, status, created_at)
VALUES ('Conscious Shopper', 'Consistently logged shopping activities', 'ACTIVITY_COUNT', 10, 'Log 10 Shopping activities', 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png', 'FaShoppingBag', '#9C27B0', 'Shopping', 'RARE', 50, 500, 2, 'CATEGORY', 'PUBLIC', 'ACTIVE', NOW());

-- 🌍 Carbon Hero: Reduced total emissions by 50 kg CO₂e
INSERT INTO badges (name, description, rule_type, rule_target, criteria, image_url, icon, color, category, difficulty, points, xp, level, badge_type, visibility, status, created_at)
VALUES ('Carbon Hero', 'Reduced total emissions by 50 kg CO₂e', 'CARBON_REDUCED', 50, 'Save 50 kg CO2e globally', 'https://cdn-icons-png.flaticon.com/512/3063/3063816.png', 'FaGlobe', '#009688', 'General', 'EPIC', 150, 1500, 3, 'MILESTONE', 'PUBLIC', 'ACTIVE', NOW());

-- 🚀 Sustainability Champion: Reduced total emissions by 100 kg CO₂e
INSERT INTO badges (name, description, rule_type, rule_target, criteria, image_url, icon, color, category, difficulty, points, xp, level, badge_type, visibility, status, created_at)
VALUES ('Sustainability Champion', 'Reduced total emissions by 100 kg CO₂e', 'CARBON_REDUCED', 100, 'Save 100 kg CO2e globally', 'https://cdn-icons-png.flaticon.com/512/3063/3063813.png', 'FaRocket', '#673AB7', 'General', 'LEGENDARY', 250, 2500, 4, 'MILESTONE', 'PUBLIC', 'ACTIVE', NOW());

-- 🥇 Weekly Leader: Finished #1 on the weekly leaderboard
INSERT INTO badges (name, description, rule_type, rule_target, criteria, image_url, icon, color, category, difficulty, points, xp, level, badge_type, visibility, status, created_at)
VALUES ('Weekly Leader', 'Finished #1 on the weekly leaderboard', 'LEADERBOARD_RANK', 1, 'Be #1 this week', 'https://cdn-icons-png.flaticon.com/512/3176/3176310.png', 'FaMedal', '#FFD700', 'General', 'EPIC', 100, 1000, 3, 'MILESTONE', 'PUBLIC', 'ACTIVE', NOW());

-- 🥈 Monthly Leader: Finished #1 on the monthly leaderboard
INSERT INTO badges (name, description, rule_type, rule_target, criteria, image_url, icon, color, category, difficulty, points, xp, level, badge_type, visibility, status, created_at)
VALUES ('Monthly Leader', 'Finished #1 on the monthly leaderboard', 'LEADERBOARD_RANK', 1, 'Be #1 this month', 'https://cdn-icons-png.flaticon.com/512/3176/3176312.png', 'FaMedal', '#C0C0C0', 'General', 'EPIC', 150, 1500, 3, 'MILESTONE', 'PUBLIC', 'ACTIVE', NOW());

-- 👑 Annual Champion: Finished #1 on the yearly leaderboard
INSERT INTO badges (name, description, rule_type, rule_target, criteria, image_url, icon, color, category, difficulty, points, xp, level, badge_type, visibility, status, created_at)
VALUES ('Annual Champion', 'Finished #1 on the yearly leaderboard', 'LEADERBOARD_RANK', 1, 'Be #1 this year', 'https://cdn-icons-png.flaticon.com/512/3176/3176311.png', 'FaCrown', '#FFD700', 'General', 'LEGENDARY', 500, 5000, 5, 'MILESTONE', 'PUBLIC', 'ACTIVE', NOW());

-- ⭐ Community Contributor: Consistently active for 90 days
INSERT INTO badges (name, description, rule_type, rule_target, criteria, image_url, icon, color, category, difficulty, points, xp, level, badge_type, visibility, status, created_at)
VALUES ('Community Contributor', 'Consistently active for 90 days', 'STREAK', 90, 'Maintain a 90 day streak', 'https://cdn-icons-png.flaticon.com/512/3176/3176313.png', 'FaStar', '#FF9800', 'General', 'LEGENDARY', 300, 3000, 4, 'MILESTONE', 'PUBLIC', 'ACTIVE', NOW());
