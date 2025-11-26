// Risk calculation utility
// This logic mirrors the risk calculator in the frontend

interface RiskFactors {
  impactScope: number; // 1-5
  businessCritical: number; // 1-5
  complexity: number; // 1-5
  testingCoverage: number; // 1-5 (inverse)
  rollbackCapability: number; // 1-5 (inverse)
  changeSize: number; // 1-5
  timeWindow: number; // 1-5
  dependencyCount: number; // 1-5
  historicalFailures: number; // 1-5
  financialImpact: number; // 1-5
}

interface RiskWeights {
  impactScope: number;
  businessCritical: number;
  complexity: number;
  testingCoverage: number;
  rollbackCapability: number;
  changeSize: number;
  timeWindow: number;
  dependencyCount: number;
  historicalFailures: number;
  financialImpact: number;
}

const DEFAULT_WEIGHTS: RiskWeights = {
  impactScope: 1.5,
  businessCritical: 1.8,
  complexity: 1.3,
  testingCoverage: 1.2,
  rollbackCapability: 1.4,
  changeSize: 1.1,
  timeWindow: 1.0,
  dependencyCount: 1.2,
  historicalFailures: 1.6,
  financialImpact: 1.7,
};

/**
 * Automatically calculate risk factors from change request wizard data
 */
export function calculateRiskFactorsFromWizardData(wizardData: any): RiskFactors {
  const factors: RiskFactors = {
    impactScope: 3,
    businessCritical: 3,
    complexity: 3,
    testingCoverage: 3,
    rollbackCapability: 3,
    changeSize: 3,
    timeWindow: 3,
    dependencyCount: 3,
    historicalFailures: 1,
    financialImpact: 3,
  };

  // Impact Scope - based on impacted users
  const impactedUsers = Number(wizardData.impactedUsers) || 0;
  if (impactedUsers === 0) factors.impactScope = 1;
  else if (impactedUsers < 10) factors.impactScope = 2;
  else if (impactedUsers < 50) factors.impactScope = 3;
  else if (impactedUsers < 200) factors.impactScope = 4;
  else factors.impactScope = 5;

  // Financial Impact - based on estimated cost
  const estimatedCost = Number(wizardData.estimatedCost) || 0;
  if (estimatedCost === 0) factors.financialImpact = 1;
  else if (estimatedCost < 1000) factors.financialImpact = 2;
  else if (estimatedCost < 5000) factors.financialImpact = 3;
  else if (estimatedCost < 20000) factors.financialImpact = 4;
  else factors.financialImpact = 5;

  // Complexity - based on effort hours
  const effortHours = Number(wizardData.estimatedEffortHours) || 0;
  if (effortHours === 0) factors.complexity = 1;
  else if (effortHours < 8) factors.complexity = 2;
  else if (effortHours < 40) factors.complexity = 3;
  else if (effortHours < 160) factors.complexity = 4;
  else factors.complexity = 5;

  // Change Size - based on systems affected
  const systemsAffected = wizardData.systemsAffected || [];
  const systemCount = Array.isArray(systemsAffected) ? systemsAffected.length : 0;
  if (systemCount === 0) factors.changeSize = 1;
  else if (systemCount === 1) factors.changeSize = 2;
  else if (systemCount === 2) factors.changeSize = 3;
  else if (systemCount < 5) factors.changeSize = 4;
  else factors.changeSize = 5;

  // Dependencies - based on dependencies array
  const dependencies = wizardData.dependencies || [];
  const depCount = Array.isArray(dependencies) ? dependencies.length : 0;
  if (depCount === 0) factors.dependencyCount = 1;
  else if (depCount === 1) factors.dependencyCount = 2;
  else if (depCount === 2) factors.dependencyCount = 3;
  else if (depCount < 5) factors.dependencyCount = 4;
  else factors.dependencyCount = 5;

  // Business Criticality - check if revenue or customer impact
  const reasons = wizardData.changeReasons || {};
  if (reasons.revenueImprovement || reasons.customerImpact) {
    factors.businessCritical = 4;
  }

  // Default assumptions for factors we can't auto-calculate
  // These can be adjusted manually via the risk calculator UI
  factors.testingCoverage = 3; // Assume moderate testing
  factors.rollbackCapability = 3; // Assume moderate rollback ability
  factors.timeWindow = 3; // Assume moderate time pressure
  factors.historicalFailures = 1; // Assume no history of failures for new changes

  return factors;
}

/**
 * Calculate risk score from factors and weights
 */
export function calculateRiskScore(
  factors: RiskFactors,
  weights: RiskWeights = DEFAULT_WEIGHTS
): { score: number; level: string } {
  let totalScore = 0;
  let totalWeight = 0;

  Object.keys(factors).forEach((key) => {
    const factorKey = key as keyof RiskFactors;
    let factorValue = factors[factorKey];

    // Inverse scoring for positive factors
    if (factorKey === 'testingCoverage' || factorKey === 'rollbackCapability') {
      factorValue = 6 - factorValue;
    }

    totalScore += factorValue * weights[factorKey];
    totalWeight += weights[factorKey];
  });

  const normalizedScore = (totalScore / totalWeight) * 20; // Scale to 0-100
  const score = Math.round(normalizedScore);

  // Determine risk level
  let level = '';
  if (normalizedScore < 25) {
    level = 'Low';
  } else if (normalizedScore < 50) {
    level = 'Medium';
  } else if (normalizedScore < 75) {
    level = 'High';
  } else {
    level = 'Critical';
  }

  return { score, level };
}

/**
 * Auto-calculate risk for a change request based on wizard data
 */
export function autoCalculateRisk(wizardData: any): { score: number; level: string } {
  const factors = calculateRiskFactorsFromWizardData(wizardData);
  return calculateRiskScore(factors);
}
