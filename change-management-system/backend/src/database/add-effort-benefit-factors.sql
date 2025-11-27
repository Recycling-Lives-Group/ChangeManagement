-- Add effort_factors and benefit_factors JSON columns to change_requests table
-- This stores the individual factor scores used to calculate effort_score and benefit_score

ALTER TABLE change_requests
ADD COLUMN effort_factors JSON DEFAULT NULL COMMENT 'Individual effort factor scores: impactScope, businessCritical, complexity, testingCoverage, rollbackCapability, historicalFailures, costToImplement, timeToImplement',
ADD COLUMN benefit_factors JSON DEFAULT NULL COMMENT 'Individual benefit factor scores: revenueImprovement, costSavings, customerImpact, processImprovement, internalQoL, urgency, impactScope, riskLevel, resourceRequirement, strategicAlignment';
