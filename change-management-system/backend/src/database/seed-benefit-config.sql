-- Seed initial benefit scoring configurations

INSERT INTO benefit_scoring_config
  (benefit_type, display_name, value_for_100_points, value_unit, time_decay_per_month, description)
VALUES
  (
    'revenueImprovement',
    'Revenue Improvement',
    100000.00,
    'GBP',
    5,
    'Annual revenue improvement in £. Max 100 points at £100,000. Time decay: -5 points per month.'
  ),
  (
    'costSavings',
    'Cost Savings',
    50000.00,
    'GBP',
    3,
    'Annual cost reduction in £. Max 100 points at £50,000. Time decay: -3 points per month.'
  ),
  (
    'customerImpact',
    'Customer Impact',
    10000.00,
    'customers',
    10,
    'Number of customers affected. Max 100 points at 10,000 customers. Time decay: -10 points per month.'
  ),
  (
    'processImprovement',
    'Process Improvement',
    1000.00,
    'hours',
    5,
    'Total hours saved annually (hours saved × number of users affected). Max 100 points at 1,000 hours. Time decay: -5 points per month.'
  ),
  (
    'internalQoL',
    'Internal Quality of Life',
    500.00,
    'hours',
    3,
    'Total hours saved for internal staff annually. Max 100 points at 500 hours. Time decay: -3 points per month.'
  )
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  value_for_100_points = VALUES(value_for_100_points),
  value_unit = VALUES(value_unit),
  time_decay_per_month = VALUES(time_decay_per_month),
  description = VALUES(description);
