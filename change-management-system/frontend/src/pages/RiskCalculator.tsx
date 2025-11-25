import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  DollarSign,
  Users,
  Clock,
  Shield,
  TrendingUp,
  Info,
  Calculator,
} from 'lucide-react';

interface RiskFactors {
  impactScope: number; // 1-5
  businessCritical: number; // 1-5
  complexity: number; // 1-5
  testingCoverage: number; // 1-5 (inverse - higher is better)
  rollbackCapability: number; // 1-5 (inverse - higher is better)
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

export const RiskCalculator: React.FC = () => {
  const [factors, setFactors] = useState<RiskFactors>({
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
  });

  const [weights, setWeights] = useState<RiskWeights>({
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
  });

  const [showWeights, setShowWeights] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    calculateRisk();
  }, [factors, weights]);

  const calculateRisk = () => {
    // Calculate weighted score
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
    setRiskScore(Math.round(normalizedScore));

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
    setRiskLevel(level);

    // Generate recommendations
    const recs: string[] = [];
    if (factors.testingCoverage < 3) {
      recs.push('Increase testing coverage before implementation');
    }
    if (factors.rollbackCapability < 3) {
      recs.push('Ensure robust rollback procedures are in place');
    }
    if (factors.complexity > 3) {
      recs.push('Consider breaking down into smaller, less complex changes');
    }
    if (factors.businessCritical > 3) {
      recs.push('Schedule during low-traffic periods and ensure 24/7 support');
    }
    if (factors.dependencyCount > 3) {
      recs.push('Review and validate all dependencies before proceeding');
    }
    if (factors.historicalFailures > 2) {
      recs.push('Address root causes of previous failures before implementation');
    }
    if (factors.financialImpact > 3) {
      recs.push('Obtain additional executive approval and prepare contingency plans');
    }

    if (recs.length === 0) {
      recs.push('Risk factors are well-managed. Proceed with standard approval process.');
    }

    setRecommendations(recs);
  };

  const handleFactorChange = (factor: keyof RiskFactors, value: number) => {
    setFactors((prev) => ({ ...prev, [factor]: value }));
  };

  const handleWeightChange = (weight: keyof RiskWeights, value: number) => {
    setWeights((prev) => ({ ...prev, [weight]: value }));
  };

  const resetToDefaults = () => {
    setFactors({
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
    });
    setWeights({
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
    });
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'Low':
        return 'text-green-600 dark:text-green-400';
      case 'Medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'High':
        return 'text-orange-600 dark:text-orange-400';
      case 'Critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRiskBgColor = () => {
    switch (riskLevel) {
      case 'Low':
        return 'bg-green-100 dark:bg-green-900';
      case 'Medium':
        return 'bg-yellow-100 dark:bg-yellow-900';
      case 'High':
        return 'bg-orange-100 dark:bg-orange-900';
      case 'Critical':
        return 'bg-red-100 dark:bg-red-900';
      default:
        return 'bg-gray-100 dark:bg-gray-900';
    }
  };

  const factorLabels: Record<keyof RiskFactors, { label: string; icon: any; help: string }> = {
    impactScope: {
      label: 'Impact Scope',
      icon: Users,
      help: 'Number of users/systems affected (1=minimal, 5=organization-wide)',
    },
    businessCritical: {
      label: 'Business Criticality',
      icon: AlertTriangle,
      help: 'How critical is the affected system to business operations (1=non-critical, 5=mission-critical)',
    },
    complexity: {
      label: 'Technical Complexity',
      icon: TrendingUp,
      help: 'Technical difficulty and complexity (1=simple, 5=highly complex)',
    },
    testingCoverage: {
      label: 'Testing Coverage',
      icon: Shield,
      help: 'Quality and extent of testing (1=minimal, 5=comprehensive)',
    },
    rollbackCapability: {
      label: 'Rollback Capability',
      icon: Shield,
      help: 'Ease of reverting changes (1=difficult, 5=easy)',
    },
    changeSize: {
      label: 'Change Size',
      icon: TrendingUp,
      help: 'Scale of the change (1=small, 5=large)',
    },
    timeWindow: {
      label: 'Implementation Window',
      icon: Clock,
      help: 'Available time for implementation (1=ample, 5=tight)',
    },
    dependencyCount: {
      label: 'Dependencies',
      icon: TrendingUp,
      help: 'Number of dependent systems/changes (1=none, 5=many)',
    },
    historicalFailures: {
      label: 'Historical Failures',
      icon: AlertTriangle,
      help: 'Past failure rate for similar changes (1=none, 5=frequent)',
    },
    financialImpact: {
      label: 'Financial Impact',
      icon: DollarSign,
      help: 'Potential financial consequences of failure (1=minimal, 5=severe)',
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Risk Assessment Calculator
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Calculate and analyze change request risk scores
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowWeights(!showWeights)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            {showWeights ? 'Hide' : 'Show'} Weights
          </button>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Factors */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Risk Factors
            </h2>
            <div className="space-y-6">
              {Object.entries(factorLabels).map(([key, { label, icon: Icon, help }]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        {label}
                      </label>
                      <div className="group relative">
                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="hidden group-hover:block absolute z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg -top-2 left-6">
                          {help}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {factors[key as keyof RiskFactors]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={factors[key as keyof RiskFactors]}
                    onChange={(e) =>
                      handleFactorChange(
                        key as keyof RiskFactors,
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Low (1)</span>
                    <span>High (5)</span>
                  </div>
                  {showWeights && (
                    <div className="mt-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400">
                        Weight: {weights[key as keyof RiskWeights]}
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={weights[key as keyof RiskWeights]}
                        onChange={(e) =>
                          handleWeightChange(
                            key as keyof RiskWeights,
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full h-1 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Risk Score Card */}
          <div className={`${getRiskBgColor()} p-6 rounded-lg shadow`}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Risk Assessment
            </h2>
            <div className="text-center">
              <div className={`text-6xl font-bold ${getRiskColor()} mb-2`}>
                {riskScore}
              </div>
              <div className={`text-2xl font-semibold ${getRiskColor()}`}>
                {riskLevel} Risk
              </div>
              <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                Score Range: 0-100
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Recommendations
            </h2>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {rec}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Approval Requirements */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Approval Requirements
            </h2>
            <div className="space-y-3 text-sm">
              {riskLevel === 'Low' && (
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="font-semibold mb-1">Level 1 Approval Required:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Coordinator review</li>
                    <li>Standard testing</li>
                    <li>Basic documentation</li>
                  </ul>
                </div>
              )}
              {riskLevel === 'Medium' && (
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="font-semibold mb-1">Level 2 Approval Required:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>CAB Member review</li>
                    <li>Enhanced testing required</li>
                    <li>Detailed documentation</li>
                    <li>Rollback plan mandatory</li>
                  </ul>
                </div>
              )}
              {riskLevel === 'High' && (
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="font-semibold mb-1">Level 3 Approval Required:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Department Head review</li>
                    <li>Comprehensive testing</li>
                    <li>Full CAB review</li>
                    <li>Detailed rollback procedures</li>
                    <li>Communication plan</li>
                  </ul>
                </div>
              )}
              {riskLevel === 'Critical' && (
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="font-semibold mb-1">Executive Approval Required:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Executive/Admin approval</li>
                    <li>Full CAB board review</li>
                    <li>Extensive testing & validation</li>
                    <li>Complete rollback strategy</li>
                    <li>Business continuity plan</li>
                    <li>Stakeholder communication</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskCalculator;
