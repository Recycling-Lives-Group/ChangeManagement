-- Create risk scoring configuration table
-- Date: 2025-12-05
-- Description: Creates risk_scoring_config table for configurable risk scoring
-- Risk score = (Cost / cost_for_100_points) * 100 + (Recovery Hours / hours_for_100_points) * 100

CREATE TABLE IF NOT EXISTS risk_scoring_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  risk_type VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  cost_for_100_points DECIMAL(15, 2) NOT NULL DEFAULT 100000.00,
  cost_unit VARCHAR(20) NOT NULL DEFAULT 'GBP',
  hours_for_100_points INT NOT NULL DEFAULT 720,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default risk scoring configuration
INSERT INTO risk_scoring_config
  (risk_type, display_name, cost_for_100_points, cost_unit, hours_for_100_points, description)
VALUES
  (
    'businessRisk',
    'Business Risk',
    100000.00,
    'GBP',
    720,
    'Risk scoring based on cost and recovery time. £100,000 cost = 100 cost points. 720 hours (1 month) recovery = 100 time points. Total risk score = cost score + time score.'
  )
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  cost_for_100_points = VALUES(cost_for_100_points),
  cost_unit = VALUES(cost_unit),
  hours_for_100_points = VALUES(hours_for_100_points),
  description = VALUES(description);

-- Verify the configuration
SELECT * FROM risk_scoring_config;
