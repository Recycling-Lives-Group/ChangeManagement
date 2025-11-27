-- Add display_name and description columns to benefit_scoring_config table

ALTER TABLE benefit_scoring_config
ADD COLUMN display_name VARCHAR(100) NOT NULL AFTER benefit_type,
ADD COLUMN description TEXT NULL AFTER time_decay_per_month;
