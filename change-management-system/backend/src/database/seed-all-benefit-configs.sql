-- Seed ALL benefit scoring configurations
-- This replaces seed-revenue-improvement.sql with a comprehensive set

INSERT INTO benefit_scoring_config
  (benefit_type, display_name, value_for_100_points, value_unit, time_decay_per_month, description)
VALUES
  -- Revenue Improvement
  (
    'revenueImprovement',
    'Revenue Improvement',
    100000.00,
    'GBP',
    5,
    'Annual revenue improvement in £. £100,000 = 100 points for value. Timeline: 5 points deducted per month delay.'
  ),

  -- Cost Savings/Reduction
  (
    'costSavings',
    'Cost Savings',
    80000.00,
    'GBP',
    4,
    'Annual cost savings in £. £80,000 = 100 points for value. Timeline: 4 points deducted per month delay.'
  ),

  -- Customer Impact
  (
    'customerImpact',
    'Customer Impact',
    10000.00,
    'customers',
    3,
    'Number of customers impacted. 10,000 customers = 100 points. Timeline: 3 points deducted per month delay.'
  ),

  -- Process Improvement
  (
    'processImprovement',
    'Process Improvement',
    100.00,
    'percentage',
    2,
    'Process efficiency improvement percentage. 100% efficiency gain = 100 points. Timeline: 2 points deducted per month delay.'
  ),

  -- Internal Quality of Life
  (
    'internalQoL',
    'Internal Quality of Life',
    500.00,
    'employees',
    2,
    'Number of employees whose quality of life improves. 500 employees = 100 points. Timeline: 2 points deducted per month delay.'
  ),

  -- Strategic Alignment (simple 1-10 scale, no timeline)
  (
    'strategicAlignment',
    'Strategic Alignment',
    10.00,
    'scale',
    0,
    'Strategic alignment score on 1-10 scale. 10 = perfect alignment = 100 points. No timeline decay.'
  )

ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  value_for_100_points = VALUES(value_for_100_points),
  value_unit = VALUES(value_unit),
  time_decay_per_month = VALUES(time_decay_per_month),
  description = VALUES(description);
