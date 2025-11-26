-- Add effort_score and benefit_score columns to change_requests table

ALTER TABLE change_requests
ADD COLUMN effort_score INT DEFAULT NULL COMMENT 'Calculated effort score combining risk and impact (0-100)',
ADD COLUMN benefit_score INT DEFAULT NULL COMMENT 'Calculated benefit score from prioritization factors (0-100)',
ADD COLUMN effort_calculated_at TIMESTAMP NULL DEFAULT NULL COMMENT 'When effort score was last calculated',
ADD COLUMN benefit_calculated_at TIMESTAMP NULL DEFAULT NULL COMMENT 'When benefit score was last calculated';
