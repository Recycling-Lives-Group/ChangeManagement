// Effort calculation utility
// This logic calculates effort score based on various factors

interface EffortFactors {
  hoursEstimated: number; // Raw hours
  costEstimated: number; // Raw cost in GBP
  teamSize: number; // Number of people
  complexity: number; // 1-5 scale
  systemsAffected: number; // Count of systems
  testingRequired: number; // 1-5 scale
  documentationRequired: number; // 1-5 scale
}

interface EffortWeights {
  hoursEstimated: number;
  costEstimated: number;
  teamSize: number;
  complexity: number;
  systemsAffected: number;
  testingRequired: number;
  documentationRequired: number;
}

const DEFAULT_WEIGHTS: EffortWeights = {
  hoursEstimated: 2.0, // Most important
  costEstimated: 1.8,
  teamSize: 1.5,
  complexity: 1.6,
  systemsAffected: 1.3,
  testingRequired: 1.2,
  documentationRequired: 1.0,
};

/**
 * Normalize a value to 0-100 scale based on thresholds
 */
function normalizeToScale(value: number, thresholds: number[]): number {
  // thresholds = [low, medium-low, medium, medium-high, high]
  // Returns 0-100 based on where value falls
  if (value <= thresholds[0]) return 0;
  if (value <= thresholds[1]) return 25;
  if (value <= thresholds[2]) return 50;
  if (value <= thresholds[3]) return 75;
  if (value <= thresholds[4]) return 90;
  return 100;
}

/**
 * Calculate effort factors from wizard data and CAB assessment
 */
export function calculateEffortFactorsFromData(data: any): EffortFactors {
  const factors: EffortFactors = {
    hoursEstimated: 0,
    costEstimated: 0,
    teamSize: 1,
    complexity: 3,
    systemsAffected: 1,
    testingRequired: 3,
    documentationRequired: 3,
  };

  // Extract hours estimated
  factors.hoursEstimated = Number(data.estimatedEffortHours) || 0;

  // Extract cost estimated
  const costStr = data.estimatedCost?.toString().replace(/[£,]/g, '') || '0';
  factors.costEstimated = parseFloat(costStr);

  // Extract team size
  factors.teamSize = Number(data.teamSize) || 1;

  // Complexity - can be provided directly or inferred from hours
  if (data.complexity) {
    factors.complexity = Number(data.complexity);
  } else {
    // Infer from hours: <8h=1, <40h=2, <160h=3, <400h=4, >=400h=5
    if (factors.hoursEstimated < 8) factors.complexity = 1;
    else if (factors.hoursEstimated < 40) factors.complexity = 2;
    else if (factors.hoursEstimated < 160) factors.complexity = 3;
    else if (factors.hoursEstimated < 400) factors.complexity = 4;
    else factors.complexity = 5;
  }

  // Systems affected
  const systemsAffected = data.systemsAffected || [];
  factors.systemsAffected = Array.isArray(systemsAffected) ? systemsAffected.length : 0;

  // Testing required - can be provided or use default
  factors.testingRequired = Number(data.testingRequired) || 3;

  // Documentation required - can be provided or use default
  factors.documentationRequired = Number(data.documentationRequired) || 3;

  return factors;
}

/**
 * Calculate effort score from factors and weights
 */
export function calculateEffortScore(
  factors: EffortFactors,
  weights: EffortWeights = DEFAULT_WEIGHTS
): { score: number; level: string; factors: EffortFactors } {
  let totalScore = 0;
  let totalWeight = 0;

  // Hours: 0h=0, 40h=25, 160h=50, 400h=75, 1000h=90, >1000h=100
  const hoursScore = normalizeToScale(factors.hoursEstimated, [0, 40, 160, 400, 1000]);
  totalScore += hoursScore * weights.hoursEstimated;
  totalWeight += weights.hoursEstimated;

  // Cost: £0=0, £1k=25, £5k=50, £20k=75, £50k=90, >£50k=100
  const costScore = normalizeToScale(factors.costEstimated, [0, 1000, 5000, 20000, 50000]);
  totalScore += costScore * weights.costEstimated;
  totalWeight += weights.costEstimated;

  // Team size: 1=0, 2=25, 3-4=50, 5-6=75, 7-9=90, 10+=100
  const teamScore = normalizeToScale(factors.teamSize, [1, 2, 4, 6, 9]);
  totalScore += teamScore * weights.teamSize;
  totalWeight += weights.teamSize;

  // Complexity: 1-5 scale to 0-100 (1=0, 2=25, 3=50, 4=75, 5=100)
  const complexityScore = (factors.complexity - 1) * 25;
  totalScore += complexityScore * weights.complexity;
  totalWeight += weights.complexity;

  // Systems affected: 0=0, 1=25, 2=50, 3-4=75, 5+=100
  const systemsScore = normalizeToScale(factors.systemsAffected, [0, 1, 2, 4, 5]);
  totalScore += systemsScore * weights.systemsAffected;
  totalWeight += weights.systemsAffected;

  // Testing required: 1-5 scale to 0-100
  const testingScore = (factors.testingRequired - 1) * 25;
  totalScore += testingScore * weights.testingRequired;
  totalWeight += weights.testingRequired;

  // Documentation required: 1-5 scale to 0-100
  const documentationScore = (factors.documentationRequired - 1) * 25;
  totalScore += documentationScore * weights.documentationRequired;
  totalWeight += weights.documentationRequired;

  // Calculate weighted average
  const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  const score = Math.round(normalizedScore);

  // Determine effort level
  let level = '';
  if (normalizedScore < 25) {
    level = 'Low';
  } else if (normalizedScore < 50) {
    level = 'Medium';
  } else if (normalizedScore < 75) {
    level = 'High';
  } else {
    level = 'Very High';
  }

  return { score, level, factors };
}

/**
 * Auto-calculate effort for a change request
 */
export function autoCalculateEffort(data: any): { score: number; level: string; factors: EffortFactors } {
  const factors = calculateEffortFactorsFromData(data);
  return calculateEffortScore(factors);
}
