-- Seed data for development/testing
-- Run this after schema.sql

-- Insert test users (password: 'password123' - bcrypt hashed)
INSERT INTO users (email, username, password_hash, first_name, last_name, role, department) VALUES
('admin@example.com', 'admin', '$2a$10$mVBGN.cyLvYHUJsVeRFCy.0Fbgju4BdhOrbGW9Tj.ZaolEMnbQ.DC', 'Admin', 'User', 'admin', 'IT'),
('john.doe@example.com', 'johndoe', '$2a$10$mVBGN.cyLvYHUJsVeRFCy.0Fbgju4BdhOrbGW9Tj.ZaolEMnbQ.DC', 'John', 'Doe', 'user', 'Engineering'),
('jane.smith@example.com', 'janesmith', '$2a$10$mVBGN.cyLvYHUJsVeRFCy.0Fbgju4BdhOrbGW9Tj.ZaolEMnbQ.DC', 'Jane', 'Smith', 'cab_member', 'Operations'),
('bob.manager@example.com', 'bobmanager', '$2a$10$mVBGN.cyLvYHUJsVeRFCy.0Fbgju4BdhOrbGW9Tj.ZaolEMnbQ.DC', 'Bob', 'Manager', 'manager', 'IT');

-- Insert sample change request
INSERT INTO change_requests (
  request_number,
  title,
  description,
  requester_id,
  status,
  priority,
  wizard_data,
  scheduling_data,
  metrics_data
) VALUES (
  'CHG-2025-0001',
  'Database Migration - Upgrade to MariaDB 11',
  'Upgrade production database from MariaDB 10.x to 11.x for improved performance',
  2,
  'submitted',
  'high',
  JSON_OBJECT(
    'change_category', 'infrastructure',
    'affected_systems', JSON_ARRAY('production-db', 'api-server'),
    'business_justification', 'Performance improvements and security patches',
    'rollback_plan', 'Snapshot restore available',
    'testing_completed', true
  ),
  JSON_OBJECT(
    'preferred_date', '2025-12-01',
    'maintenance_window', 'weekend',
    'estimated_duration', 120,
    'blackout_dates', JSON_ARRAY()
  ),
  JSON_OBJECT(
    'complexity_score', 7,
    'risk_score', 5,
    'business_impact', 8
  )
);
