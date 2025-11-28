// Benefit factor calculation utilities

export interface BenefitFactorData {
  rawValue?: number;
  rawTimeline?: number;
  explanation?: string;
  valueScore?: number;
  timeScore?: number;
  combinedScore?: number;
  weightedScore?: number;
  score?: number;
}

export interface BenefitFactors {
  revenueImprovement?: BenefitFactorData;
  costSavings?: BenefitFactorData;
  customerImpact?: BenefitFactorData;
  processImprovement?: BenefitFactorData;
  internalQoL?: BenefitFactorData;
  strategicAlignment?: { score: number; explanation: string; weightedScore?: number };
}

export interface PriorityWeights {
  revenueImprovement: number;
  costSavings: number;
  customerImpact: number;
  processImprovement: number;
  internalQoL: number;
  urgency: number;
  impactScope: number;
  riskLevel: number;
  resourceRequirement: number;
  strategicAlignment: number;
}

// Extract benefit factors from wizard data
export function extractBenefitFactors(wizardData: any, weights: PriorityWeights): { factors: BenefitFactors; score: number } {
  const factors: BenefitFactors = {};
  let totalScore = 0;
  let totalWeight = 0;

  // Revenue Improvement
  if (wizardData.changeReasons?.revenueImprovement && wizardData.revenueDetails) {
    const rawValue = parseFloat(wizardData.revenueDetails.expectedRevenue?.replace(/[£,]/g, '') || '0');
    const rawTimeline = parseInt(wizardData.revenueDetails.revenueTimeline || '12');
    const valueScore = Math.min(10, (rawValue / 10000)); // £10k = 1 point
    const timeScore = Math.max(1, 10 - (rawTimeline / 6)); // 6 months = 9 points
    const combinedScore = valueScore + timeScore;
    const weightedScore = combinedScore * weights.revenueImprovement;

    factors.revenueImprovement = {
      rawValue,
      rawTimeline,
      explanation: wizardData.revenueDetails.revenueDescription || '',
      valueScore,
      timeScore,
      combinedScore,
      weightedScore,
    };

    totalScore += weightedScore;
    totalWeight += weights.revenueImprovement;
  }

  // Cost Savings
  if (wizardData.changeReasons?.costReduction && wizardData.costReductionDetails) {
    const rawValue = parseFloat(wizardData.costReductionDetails.expectedSavings?.replace(/[£,]/g, '') || '0');
    const valueScore = Math.min(10, (rawValue / 8000)); // £8k = 1 point
    const timeScore = 5; // Assume mid-term
    const combinedScore = valueScore + timeScore;
    const weightedScore = combinedScore * weights.costSavings;

    factors.costSavings = {
      rawValue,
      explanation: wizardData.costReductionDetails.savingsDescription || '',
      valueScore,
      timeScore,
      combinedScore,
      weightedScore,
    };

    totalScore += weightedScore;
    totalWeight += weights.costSavings;
  }

  // Customer Impact
  if (wizardData.changeReasons?.customerImpact && wizardData.customerImpactDetails) {
    const score = parseInt(wizardData.customerImpactDetails.expectedSatisfaction || '5');
    const weightedScore = score * weights.customerImpact;

    factors.customerImpact = {
      score,
      explanation: wizardData.customerImpactDetails.impactDescription || '',
      weightedScore,
    };

    totalScore += weightedScore;
    totalWeight += weights.customerImpact;
  }

  // Process Improvement
  if (wizardData.changeReasons?.processImprovement && wizardData.processImprovementDetails) {
    const efficiencyGain = parseInt(wizardData.processImprovementDetails.expectedEfficiency?.replace(/[%]/g, '') || '0');
    const score = Math.min(10, efficiencyGain / 10); // 10% = 1 point
    const weightedScore = score * weights.processImprovement;

    factors.processImprovement = {
      score,
      explanation: wizardData.processImprovementDetails.processDescription || '',
      weightedScore,
    };

    totalScore += weightedScore;
    totalWeight += weights.processImprovement;
  }

  // Internal QoL
  if (wizardData.changeReasons?.internalQoL && wizardData.internalQoLDetails) {
    const usersAffected = parseInt(wizardData.internalQoLDetails.usersAffected || '10');
    const score = Math.min(10, usersAffected / 10); // 10 users = 1 point
    const weightedScore = score * weights.internalQoL;

    factors.internalQoL = {
      score,
      explanation: wizardData.internalQoLDetails.expectedImprovements || '',
      weightedScore,
    };

    totalScore += weightedScore;
    totalWeight += weights.internalQoL;
  }

  // Strategic Alignment - always included
  const isStrategic = wizardData.changeReasons?.revenueImprovement || wizardData.changeReasons?.costReduction;
  const strategicScore = isStrategic ? 8 : 5;
  const strategicWeighted = strategicScore * weights.strategicAlignment;

  factors.strategicAlignment = {
    score: strategicScore,
    explanation: isStrategic ? 'Aligns with revenue/cost objectives' : 'Standard alignment',
    weightedScore: strategicWeighted,
  };

  totalScore += strategicWeighted;
  totalWeight += weights.strategicAlignment;

  // Calculate normalized score (0-100)
  const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) * 10 : 0;

  return {
    factors,
    score: Math.round(normalizedScore * 10) / 10,
  };
}
