-- Update user passwords with proper bcrypt hashes
-- Password for all users: 'password123'

UPDATE users SET password_hash = '$2a$10$mVBGN.cyLvYHUJsVeRFCy.0Fbgju4BdhOrbGW9Tj.ZaolEMnbQ.DC' WHERE email = 'admin@example.com';
UPDATE users SET password_hash = '$2a$10$mVBGN.cyLvYHUJsVeRFCy.0Fbgju4BdhOrbGW9Tj.ZaolEMnbQ.DC' WHERE email = 'john.doe@example.com';
UPDATE users SET password_hash = '$2a$10$mVBGN.cyLvYHUJsVeRFCy.0Fbgju4BdhOrbGW9Tj.ZaolEMnbQ.DC' WHERE email = 'jane.smith@example.com';
UPDATE users SET password_hash = '$2a$10$mVBGN.cyLvYHUJsVeRFCy.0Fbgju4BdhOrbGW9Tj.ZaolEMnbQ.DC' WHERE email = 'bob.manager@example.com';
