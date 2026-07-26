-- V3__Gamification_Enterprise.sql

-- Add new columns to point_history
ALTER TABLE point_history
ADD COLUMN transaction_id VARCHAR(36) UNIQUE,
ADD COLUMN action_type VARCHAR(50),
ADD COLUMN source_module VARCHAR(50),
ADD COLUMN status VARCHAR(20) DEFAULT 'AWARDED';

-- Create GamificationConfig table
CREATE TABLE gamification_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL UNIQUE,
    points BIGINT NOT NULL,
    max_daily_limit INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create LevelConfig table
CREATE TABLE level_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    level_name VARCHAR(50) NOT NULL UNIQUE,
    min_points BIGINT NOT NULL,
    max_points BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Default Gamification Rules
INSERT INTO gamification_config (action_type, points, max_daily_limit) VALUES 
('FIRST_ACTIVITY_LOGGED', 10, NULL),
('DAILY_ACTIVITY_LOGGED', 5, 1),
('GOAL_CREATED', 20, 3),
('GOAL_COMPLETED', 100, NULL),
('PROFILE_COMPLETED', 30, 1),
('RECOMMENDATION_FOLLOWED', 25, 5),
('STREAK_7_DAY', 50, NULL),
('STREAK_30_DAY', 200, NULL),
('STREAK_60_DAY', 500, NULL),
('STREAK_90_DAY', 1000, NULL);

-- Insert Default Levels
INSERT INTO level_config (level_name, min_points, max_points) VALUES 
('Eco Beginner', 0, 499),
('Eco Explorer', 500, 999),
('Green Champion', 1000, 1999),
('Climate Hero', 2000, 4999),
('Earth Guardian', 5000, NULL);
