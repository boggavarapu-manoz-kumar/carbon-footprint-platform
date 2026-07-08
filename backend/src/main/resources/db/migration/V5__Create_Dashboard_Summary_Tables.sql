-- V5__Create_Dashboard_Summary_Tables.sql

-- 1. Create Dashboard Metrics Summary Table
-- Always contains exactly 1 row (id = 1) for O(1) fetch
CREATE TABLE dashboard_metrics_summary (
    id BIGINT PRIMARY KEY,
    total_users BIGINT NOT NULL DEFAULT 0,
    active_users BIGINT NOT NULL DEFAULT 0,
    new_registrations BIGINT NOT NULL DEFAULT 0,
    total_emissions DECIMAL(19,4) NOT NULL DEFAULT 0,
    total_activities BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Create User Emission Summary (For Leaderboards)
-- Pre-aggregated per user
CREATE TABLE user_emission_summary (
    user_id BIGINT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    total_emission DECIMAL(19,4) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_emission_summary_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add index on total_emission for fast sorting on Leaderboard reads
CREATE INDEX idx_ues_total_emission ON user_emission_summary(total_emission DESC);

-- 3. Create Daily Emission Summary (For Emission Trends)
-- Pre-aggregated per day
CREATE TABLE daily_emission_summary (
    log_date DATE PRIMARY KEY,
    total_emission DECIMAL(19,4) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Database Indexing for Raw Tables to speed up background aggregation
-- (Check if these exist first in production systems, but assuming fresh Flyway migration here)
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_activity_logs_log_date ON activity_logs(log_date);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
