// Effort calculation utility
// This logic calculates effort score based on various factors

interface EffortFactors {
  hoursEstimated: number; // Raw hours
  costEstimated: number; // Raw cost in GBP
  resourceRequirement: number; // 1-10 scale (number of people)
  complexity: number; // 1-10 scale
  systemsAffected: number; // Count of systems
  testingRequired: number; // 1-10 scale
  documentationRequired: number; // 1-10 scale
  urgency: number; // 1-10 scale
}

interface EffortWeights {
  hoursEstimated: number;
  costEstimated: number;
  resourceRequirement: number;
  complexity: number;
  systemsAffected: number;
  testingRequired: number;
  documentationRequired: number;
  urgency: number;
}

const DEFAULT_WEIGHTS: EffortWeights = {
  hoursEstimated: 2.0,         // Most important
  costEstimated: 1.8,          // Very High
  resourceRequirement: 1.5,    // Medium-High
  complexity: 1.6,             // High
  systemsAffected: 1.3,        // Medium
  testingRequired: 1.2,        // Medium
  documentationRequired: 1.0,  // Lower
  urgency: 1.8,                // High - Time sensitivity
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
    resourceRequirement: 1,
    complexity: 5,
    systemsAffected: 1,
    testingRequired: 5,
    documentationRequired: 5,
    urgency: 5,
  };

  // Extract hours estimated
  factors.hoursEstimated = Number(data.estimatedEffortHours) || 0;

  // Extract cost estimated
  const costStr = data.estimatedCost?.toString().replace(/[£,]/g, '') || '0';
  factors.costEstimated = parseFloat(costStr);

  // Extract resource requirement (renamed from teamSize)
  factors.resourceRequirement = Number(data.resourceRequirement || data.teamSize) || 1;

  // Complexity - can be provided directly or inferred from hours
  if (data.complexity) {
    factors.complexity = Number(data.complexity);
  } else {
    // Infer from hours: <8h=1, <40h=3, <160h=5, <400h=7, >=400h=10
    if (factors.hoursEstimated < 8) factors.complexity = 1;
    else if (factors.hoursEstimated < 40) factors.complexity = 3;
    else if (factors.hoursEstimated < 160) factors.complexity = 5;
    else if (factors.hoursEstimated < 400) factors.complexity = 7;
    else factors.complexity = 10;
  }

  // Systems affected - handle both count and array
  if (typeof data.systemsAffectedCount === 'number') {
    factors.systemsAffected = data.systemsAffectedCount;
  } else if (Array.isArray(data.systemsAffected)) {
    factors.systemsAffected = data.systemsAffected.length;
  } else {
    factors.systemsAffected = Number(data.systemsAffected) || 1;
  }

  // Testing required - can be provided or use default (1-10 scale)
  factors.testingRequired = Number(data.testingRequired) || 5;

  // Documentation required - can be provided or use default (1-10 scale)
  factors.documentationRequired = Number(data.documentationRequired) || 5;

  // Urgency - time sensitivity (1-10 scale)
  factors.urgency = Number(data.urgency) || 5;

  return factors;
}

/**
 * Calculate effort score from factors and weights
 */
export function calculateEffortScore(
  factors: EffortFactors,
  weights: EffortWeights = DEFAULT_WEIGHTS
): { score: number; level: string; factors: any } {
  let totalScore = 0;
  let totalWeight = 0;

  // Build detailed factor breakdown (matching benefit calculator structure)
  const detailedFactors: any = {};

  // Hours: 0h=0, 40h=25, 160h=50, 400h=75, 1000h=90, >1000h=100
  const hoursScore = normalizeToScale(factors.hoursEstimated, [0, 40, 160, 400, 1000]);
  const hoursWeighted = hoursScore * weights.hoursEstimated;
  detailedFactors.hoursEstimated = {
    rawValue: factors.hoursEstimated,
    score: hoursScore,
    weightedScore: hoursWeighted,
  };
  totalScore += hoursWeighted;
  totalWeight += weights.hoursEstimated;

  // Cost: £0=0, £1k=25, £5k=50, £20k=75, £50k=90, >£50k=100
  const costScore = normalizeToScale(factors.costEstimated, [0, 1000, 5000, 20000, 50000]);
  const costWeighted = costScore * weights.costEstimated;
  detailedFactors.costEstimated = {
    rawValue: factors.costEstimated,
    score: costScore,
    weightedScore: costWeighted,
  };
  totalScore += costWeighted;
  totalWeight += weights.costEstimated;

  // Resource Requirement: 1-10 scale to 0-100 (1=0, 10=100)
  const resourceScore = ((factors.resourceRequirement - 1) / 9) * 100;
  const resourceWeighted = resourceScore * weights.resourceRequirement;
  detailedFactors.resourceRequirement = {
    rawValue: factors.resourceRequirement,
    score: resourceScore,
    weightedScore: resourceWeighted,
  };
  totalScore += resourceWeighted;
  totalWeight += weights.resourceRequirement;

  // Complexity: 1-10 scale to 0-100 (1=0, 10=100)
  const complexityScore = ((factors.complexity - 1) / 9) * 100;
  const complexityWeighted = complexityScore * weights.complexity;
  detailedFactors.complexity = {
    rawValue: factors.complexity,
    score: complexityScore,
    weightedScore: complexityWeighted,
  };
  totalScore += complexityWeighted;
  totalWeight += weights.complexity;

  // Systems affected: 0=0, 1=25, 2=50, 3-4=75, 5+=100
  const systemsScore = normalizeToScale(factors.systemsAffected, [0, 1, 2, 4, 5]);
  const systemsWeighted = systemsScore * weights.systemsAffected;
  detailedFactors.systemsAffected = {
    rawValue: factors.systemsAffected,
    score: systemsScore,
    weightedScore: systemsWeighted,
  };
  totalScore += systemsWeighted;
  totalWeight += weights.systemsAffected;

  // Testing required: 1-10 scale to 0-100 (1=0, 10=100)
  const testingScore = ((factors.testingRequired - 1) / 9) * 100;
  const testingWeighted = testingScore * weights.testingRequired;
  detailedFactors.testingRequired = {
    rawValue: factors.testingRequired,
    score: testingScore,
    weightedScore: testingWeighted,
  };
  totalScore += testingWeighted;
  totalWeight += weights.testingRequired;

  // Documentation required: 1-10 scale to 0-100 (1=0, 10=100)
  const documentationScore = ((factors.documentationRequired - 1) / 9) * 100;
  const documentationWeighted = documentationScore * weights.documentationRequired;
  detailedFactors.documentationRequired = {
    rawValue: factors.documentationRequired,
    score: documentationScore,
    weightedScore: documentationWeighted,
  };
  totalScore += documentationWeighted;
  totalWeight += weights.documentationRequired;

  // Urgency: 1-10 scale to 0-100 (1=0, 10=100)
  const urgencyScore = ((factors.urgency - 1) / 9) * 100;
  const urgencyWeighted = urgencyScore * weights.urgency;
  detailedFactors.urgency = {
    rawValue: factors.urgency,
    score: urgencyScore,
    weightedScore: urgencyWeighted,
  };
  totalScore += urgencyWeighted;
  totalWeight += weights.urgency;

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

  return { score, level, factors: detailedFactors };
}

/**
 * Auto-calculate effort for a change request
 */
export function autoCalculateEffort(data: any): { score: number; level: string; factors: EffortFactors } {
  const factors = calculateEffortFactorsFromData(data);
  return calculateEffortScore(factors);
}
