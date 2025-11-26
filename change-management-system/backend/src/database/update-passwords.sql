-- Update user passwords with proper bcrypt hashes
-- Password for all users: 'password123'

DELETE FROM users;

INSERT INTO users (email, username, password_hash, first_name, last_name, role, department) VALUES
('admin@example.com', 'admin', '$2a$10$mVBGN.cyLvYHUJsVeRFCy.0Fbgju4BdhOrbGW9Tj.ZaolEMnbQ.DC', 'Admin', 'User', 'admin', 'IT'),
('john.doe@example.com', 'johndoe', '$2a$10$mVBGN.cyLvYHUJsVeRFCy.0Fbgju4BdhOrbGW9Tj.ZaolEMnbQ.DC', 'John', 'Doe', 'user', 'Engineering'),
('jane.smith@example.com', 'janesmith', '$2a$10$mVBGN.cyLvYHUJsVeRFCy.0Fbgju4BdhOrbGW9Tj.ZaolEMnbQ.DC', 'Jane', 'Smith', 'cab_member', 'Operations'),
('bob.manager@example.com', 'bobmanager', '$2a$10$mVBGN.cyLvYHUJsVeRFCy.0Fbgju4BdhOrbGW9Tj.ZaolEMnbQ.DC', 'Bob', 'Manager', 'manager', 'IT');
