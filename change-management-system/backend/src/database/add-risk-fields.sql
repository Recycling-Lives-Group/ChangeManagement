-- Add risk assessment fields to change_requests table
ALTER TABLE change_requests
ADD COLUMN risk_score INT DEFAULT NULL COMMENT 'Calculated risk score (0-100)',
ADD COLUMN risk_level VARCHAR(20) DEFAULT NULL COMMENT 'Risk level: Low, Medium, High, Critical',
ADD COLUMN risk_calculated_at TIMESTAMP NULL DEFAULT NULL COMMENT 'When risk was last calculated',
ADD COLUMN risk_calculated_by INT DEFAULT NULL COMMENT 'User ID who calculated/approved the risk',
ADD CONSTRAINT fk_risk_calculated_by FOREIGN KEY (risk_calculated_by) REFERENCES users(id);
