// Benefit factor calculation utilities

export interface BenefitConfig {
  benefitType: string;
  displayName: string;
  valueFor100Points: number;
  valueUnit: string;
  timeDecayPerMonth: number;
  description?: string;
}

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

// Calculate base score from raw value using database config
function calculateValueScore(rawValue: number, config: BenefitConfig): number {
  if (!config || config.valueFor100Points === 0) return 0;
  // rawValue / valueFor100Points * 100 = points (0-100 scale)
  const points = (rawValue / config.valueFor100Points) * 100;
  return Math.min(100, Math.max(0, points));
}

// Calculate time score using database config (timeline decay)
function calculateTimeScore(timelineMonths: number, config: BenefitConfig): number {
  if (!config || config.timeDecayPerMonth === 0) return 100;
  // Start at 100 points, subtract decay per month
  const points = 100 - (timelineMonths * config.timeDecayPerMonth);
  return Math.max(0, points);
}

// Extract benefit factors from wizard data
export function extractBenefitFactors(
  wizardData: any,
  weights: PriorityWeights,
  configs: Record<string, BenefitConfig>
): { factors: BenefitFactors; score: number } {
  const factors: BenefitFactors = {};
  let totalScore = 0;
  let totalWeight = 0;

  // Revenue Improvement
  if (wizardData.changeReasons?.revenueImprovement && wizardData.revenueDetails && configs.revenueImprovement) {
    const rawValue = parseFloat(wizardData.revenueDetails.expectedRevenue?.replace(/[£,]/g, '') || '0');
    const rawTimeline = parseInt(wizardData.revenueDetails.revenueTimeline || '12');
    const valueScore = calculateValueScore(rawValue, configs.revenueImprovement);
    const timeScore = calculateTimeScore(rawTimeline, configs.revenueImprovement);
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
  if (wizardData.changeReasons?.costReduction && wizardData.costReductionDetails && configs.costSavings) {
    const rawValue = parseFloat(wizardData.costReductionDetails.expectedSavings?.replace(/[£,]/g, '') || '0');
    const rawTimeline = parseInt(wizardData.costReductionDetails.savingsTimeline || '12');
    const valueScore = calculateValueScore(rawValue, configs.costSavings);
    const timeScore = calculateTimeScore(rawTimeline, configs.costSavings);
    const combinedScore = valueScore + timeScore;
    const weightedScore = combinedScore * weights.costSavings;

    factors.costSavings = {
      rawValue,
      rawTimeline,
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
  if (wizardData.changeReasons?.customerImpact && wizardData.customerImpactDetails && configs.customerImpact) {
    const rawValue = parseInt(wizardData.customerImpactDetails.customersAffected || '0');
    const rawTimeline = parseInt(wizardData.customerImpactDetails.impactTimeline || '12');
    const valueScore = calculateValueScore(rawValue, configs.customerImpact);
    const timeScore = calculateTimeScore(rawTimeline, configs.customerImpact);
    const combinedScore = valueScore + timeScore;
    const weightedScore = combinedScore * weights.customerImpact;

    factors.customerImpact = {
      rawValue,
      rawTimeline,
      explanation: wizardData.customerImpactDetails.impactDescription || '',
      valueScore,
      timeScore,
      combinedScore,
      weightedScore,
    };

    totalScore += weightedScore;
    totalWeight += weights.customerImpact;
  }

  // Process Improvement
  if (wizardData.changeReasons?.processImprovement && wizardData.processImprovementDetails && configs.processImprovement) {
    const efficiencyGain = parseInt(wizardData.processImprovementDetails.expectedEfficiency?.replace(/[%]/g, '') || '0');
    const rawTimeline = parseInt(wizardData.processImprovementDetails.improvementTimeline || '12');
    const valueScore = calculateValueScore(efficiencyGain, configs.processImprovement);
    const timeScore = calculateTimeScore(rawTimeline, configs.processImprovement);
    const combinedScore = valueScore + timeScore;
    const weightedScore = combinedScore * weights.processImprovement;

    factors.processImprovement = {
      rawValue: efficiencyGain,
      rawTimeline,
      explanation: wizardData.processImprovementDetails.processDescription || '',
      valueScore,
      timeScore,
      combinedScore,
      weightedScore,
    };

    totalScore += weightedScore;
    totalWeight += weights.processImprovement;
  }

  // Internal QoL
  if (wizardData.changeReasons?.internalQoL && wizardData.internalQoLDetails && configs.internalQoL) {
    const usersAffected = parseInt(wizardData.internalQoLDetails.usersAffected || '0');
    const rawTimeline = parseInt(wizardData.internalQoLDetails.qolTimeline || '12');
    const valueScore = calculateValueScore(usersAffected, configs.internalQoL);
    const timeScore = calculateTimeScore(rawTimeline, configs.internalQoL);
    const combinedScore = valueScore + timeScore;
    const weightedScore = combinedScore * weights.internalQoL;

    factors.internalQoL = {
      rawValue: usersAffected,
      rawTimeline,
      explanation: wizardData.internalQoLDetails.expectedImprovements || '',
      valueScore,
      timeScore,
      combinedScore,
      weightedScore,
    };

    totalScore += weightedScore;
    totalWeight += weights.internalQoL;
  }

  // Strategic Alignment - always included (value-only, no timeline)
  if (configs.strategicAlignment) {
    const isStrategic = wizardData.changeReasons?.revenueImprovement || wizardData.changeReasons?.costReduction;
    const rawValue = isStrategic ? 80 : 50; // 80 for strategic, 50 for standard
    const strategicScore = calculateValueScore(rawValue, configs.strategicAlignment);
    const strategicWeighted = strategicScore * weights.strategicAlignment;

    factors.strategicAlignment = {
      score: strategicScore,
      explanation: isStrategic ? 'Aligns with revenue/cost objectives' : 'Standard alignment',
      weightedScore: strategicWeighted,
    };

    totalScore += strategicWeighted;
    totalWeight += weights.strategicAlignment;
  }

  // Calculate normalized score (0-100)
  // Since each factor is now 0-200 scale (value 0-100 + time 0-100), normalize properly
  const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) / 2 : 0; // Divide by 2 because combined scores are 0-200

  return {
    factors,
    score: Math.round(normalizedScore * 10) / 10,
  };
}
