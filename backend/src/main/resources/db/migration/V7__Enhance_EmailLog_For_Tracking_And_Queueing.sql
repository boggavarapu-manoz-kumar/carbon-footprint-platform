ALTER TABLE email_logs
ADD COLUMN retry_count INT DEFAULT 0 NOT NULL,
ADD COLUMN next_retry_at TIMESTAMP,
ADD COLUMN tracking_id VARCHAR(255),
ADD COLUMN opened BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN clicked BOOLEAN DEFAULT FALSE NOT NULL;

CREATE UNIQUE INDEX idx_email_logs_tracking_id ON email_logs(tracking_id);
CREATE INDEX idx_email_logs_status_next_retry ON email_logs(status, next_retry_at);
