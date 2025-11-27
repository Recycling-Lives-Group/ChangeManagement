-- Seed Revenue Improvement benefit scoring configuration
-- NOTE: Run add-benefit-config-fields.sql FIRST to add display_name and description columns

INSERT INTO benefit_scoring_config
  (benefit_type, display_name, value_for_100_points, value_unit, time_decay_per_month, description)
VALUES
  (
    'revenueImprovement',
    'Revenue Improvement',
    100000.00,
    'GBP',
    5,
    'Annual revenue improvement in £. Example: £100,000 = 100 points (value), 0 months = 100 points (time), instant = 200 total points.'
  )
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  value_for_100_points = VALUES(value_for_100_points),
  value_unit = VALUES(value_unit),
  time_decay_per_month = VALUES(time_decay_per_month),
  description = VALUES(description);
