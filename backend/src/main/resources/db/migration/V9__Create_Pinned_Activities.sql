CREATE TABLE IF NOT EXISTS pinned_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    activity_type_id BIGINT NOT NULL,
    dynamic_inputs TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pinned_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pinned_activity_type FOREIGN KEY (activity_type_id) REFERENCES activity_types(id) ON DELETE CASCADE
);

CREATE INDEX idx_pinned_activities_user ON pinned_activities (user_id);
