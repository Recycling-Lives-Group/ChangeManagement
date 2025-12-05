-- Migration: Update Process Improvement benefit config from percentage to hours
-- Date: 2025-12-05
-- Description: Changes the Process Improvement metric from efficiency gain percentage to hours saved

UPDATE benefit_scoring_config
SET
  value_for_100_points = 1000.00,
  value_unit = 'hours',
  description = 'Hours saved through process improvement. 1,000 hours saved = 100 points. Timeline: 2 points deducted per month delay.'
WHERE benefit_type = 'processImprovement';

-- Verify the update
SELECT
  benefit_type,
  display_name,
  value_for_100_points,
  value_unit,
  description
FROM benefit_scoring_config
WHERE benefit_type = 'processImprovement';
