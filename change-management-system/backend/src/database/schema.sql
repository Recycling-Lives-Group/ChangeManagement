-- Change Management System - Flexible Schema
-- MariaDB/MySQL compatible

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('user', 'manager', 'cab_member', 'admin') DEFAULT 'user',
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Change Requests table (with flexible JSON columns)
CREATE TABLE IF NOT EXISTS change_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Core fields
  requester_id INT NOT NULL,
  status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',

  -- Flexible JSON columns for evolving requirements
  wizard_data JSON COMMENT 'All wizard form fields - flexible structure',
  scheduling_data JSON COMMENT 'Scheduling details, maintenance windows, etc',
  metrics_data JSON COMMENT 'Analytics and metrics data points',
  prioritization_data JSON COMMENT 'Data for future prioritization engine',
  custom_fields JSON COMMENT 'Any additional custom fields',

  -- Timestamps
  submitted_at TIMESTAMP NULL,
  scheduled_start TIMESTAMP NULL,
  scheduled_end TIMESTAMP NULL,
  actual_start TIMESTAMP NULL,
  actual_end TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (requester_id) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_requester (requester_id),
  INDEX idx_created (created_at),
  INDEX idx_request_number (request_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CAB (Change Advisory Board) Reviews table
CREATE TABLE IF NOT EXISTS cab_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  change_request_id INT NOT NULL,
  reviewer_id INT NOT NULL,

  -- Core review fields
  vote ENUM('pending', 'approved', 'rejected', 'abstain') DEFAULT 'pending',
  risk_level ENUM('low', 'medium', 'high', 'critical') NULL,
  change_type VARCHAR(100) COMMENT 'standard, normal, emergency, etc',

  -- Flexible JSON for additional review data
  review_data JSON COMMENT 'Risk assessments, impact analysis, custom criteria',
  comments TEXT,

  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (change_request_id) REFERENCES change_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id),
  UNIQUE KEY unique_review (change_request_id, reviewer_id),
  INDEX idx_change_request (change_request_id),
  INDEX idx_reviewer (reviewer_id),
  INDEX idx_vote (vote)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Change History / Audit Trail
CREATE TABLE IF NOT EXISTS change_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  change_request_id INT NOT NULL,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL COMMENT 'created, updated, submitted, approved, etc',
  field_name VARCHAR(100) NULL,
  old_value TEXT NULL,
  new_value TEXT NULL,
  metadata JSON COMMENT 'Additional context about the change',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (change_request_id) REFERENCES change_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_change_request (change_request_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comments/Discussion table
CREATE TABLE IF NOT EXISTS change_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  change_request_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE COMMENT 'Internal CAB notes vs public comments',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (change_request_id) REFERENCES change_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_change_request (change_request_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attachments table
CREATE TABLE IF NOT EXISTS change_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  change_request_id INT NOT NULL,
  uploaded_by INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100),
  file_size INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (change_request_id) REFERENCES change_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_change_request (change_request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  change_request_id INT NULL,
  type VARCHAR(50) NOT NULL COMMENT 'submission, approval, rejection, comment, etc',
  title VARCHAR(255) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (change_request_id) REFERENCES change_requests(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
