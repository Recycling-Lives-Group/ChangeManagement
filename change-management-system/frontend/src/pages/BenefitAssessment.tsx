import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingUp,
  PoundSterling,
  Clock,
  Users,
  AlertTriangle,
  Settings,
  Info,
  BarChart3,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useChangesStore } from '../store/changesStore';

interface ChangeRequest {
  id: string;
  title: string;
  type: 'emergency' | 'major' | 'minor' | 'standard';
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  requester: string;
  submittedDate: Date;
  targetDate: Date;
  factors: PriorityFactors;
  priorityScore?: number;
  priorityRank?: number;
}

interface PriorityFactors {
  revenueImprovement: number; // 1-10
  costSavings: number; // 1-10
  customerImpact: number; // 1-10
  processImprovement: number; // 1-10
  internalQoL: number; // 1-10
  urgency: number; // 1-10
  impactScope: number; // 1-10
  riskLevel: number; // 1-10
  resourceRequirement: number; // 1-10 (inverse - lower is better)
  strategicAlignment: number; // 1-10
}

interface PriorityWeights {
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

export const BenefitAssessment: React.FC = () => {
  const { changes: storeChanges, fetchChanges } = useChangesStore();
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [weights, setWeights] = useState<PriorityWeights>({
    revenueImprovement: 2.5,    // Highest - Revenue generation
    costSavings: 2.3,           // Very High - Cost reduction
    customerImpact: 2.2,        // Very High - Customer satisfaction
    processImprovement: 1.9,    // High - Operational efficiency
    internalQoL: 1.6,           // Medium-High - Employee satisfaction
    strategicAlignment: 2.0,    // High - Long-term goals
    urgency: 1.8,               // High - Time sensitivity
    impactScope: 1.5,           // Medium - Scale of change
    riskLevel: 1.4,             // Medium - Risk consideration
    resourceRequirement: 1.0,   // Low - Resources needed (inverse)
  });
  const [showWeightConfig, setShowWeightConfig] = useState(false);
  const [sortedChanges, setSortedChanges] = useState<ChangeRequest[]>([]);

  // Fetch changes on mount
  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  // Convert store changes to prioritization format
  useEffect(() => {
    const convertedChanges: ChangeRequest[] = storeChanges
      .filter(change => change.status !== 'rejected' && change.status !== 'cancelled' && change.status !== 'completed')
      .map(change => {
        const wizardData = change.wizardData || {};

        // Extract factor values from wizard data
        const factors: PriorityFactors = {
          revenueImprovement: wizardData.changeReasons?.revenueImprovement ? 8 : 3,
          costSavings: wizardData.changeReasons?.costReduction ? 8 : 3,
          customerImpact: wizardData.changeReasons?.customerImpact ? 8 : 3,
          processImprovement: wizardData.changeReasons?.processImprovement ? 7 : 3,
          internalQoL: wizardData.changeReasons?.internalQoL ? 7 : 3,
          urgency: wizardData.urgencyLevel === 'high' ? 9 : wizardData.urgencyLevel === 'medium' ? 6 : 3,
          impactScope: Math.min(10, Math.ceil((Number(wizardData.impactedUsers) || 0) / 100)),
          riskLevel: change.riskScore ? Math.ceil(change.riskScore / 10) : 5,
          resourceRequirement: Math.min(10, Math.ceil((Number(wizardData.estimatedEffortHours) || 0) / 40)),
          strategicAlignment: wizardData.changeReasons?.revenueImprovement || wizardData.changeReasons?.costReduction ? 8 : 5,
        };

        return {
          id: change.requestNumber || change.id,
          title: change.title,
          type: change.priority === 'critical' ? 'emergency' : change.priority === 'high' ? 'major' : change.priority === 'medium' ? 'standard' : 'minor',
          riskLevel: (change.riskLevel?.toLowerCase() as 'critical' | 'high' | 'medium' | 'low') || 'medium',
          requester: change.requester?.name || 'Unknown',
          submittedDate: change.submittedAt ? new Date(change.submittedAt) : new Date(),
          targetDate: wizardData.proposedDate ? new Date(wizardData.proposedDate) : new Date(),
          factors,
        };
      });

    setChanges(convertedChanges);
  }, [storeChanges]);

  const calculatePriorities = () => {
    if (changes.length === 0) {
      setSortedChanges([]);
      return;
    }
    const changesWithScores = changes.map((change) => {
      let totalScore = 0;
      let totalWeight = 0;

      Object.keys(change.factors).forEach((key) => {
        const factorKey = key as keyof PriorityFactors;
        let factorValue = change.factors[factorKey];

        // Inverse scoring for resource requirement (lower is better)
        if (factorKey === 'resourceRequirement') {
          factorValue = 11 - factorValue;
        }

        totalScore += factorValue * weights[factorKey];
        totalWeight += weights[factorKey];
      });

      const normalizedScore = (totalScore / totalWeight) * 10; // Scale to 0-100
      return {
        ...change,
        priorityScore: Math.round(normalizedScore * 10) / 10,
      };
    });

    // Sort by score descending
    const sorted = changesWithScores.sort(
      (a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)
    );

    // Add rank
    const ranked = sorted.map((change, index) => ({
      ...change,
      priorityRank: index + 1,
    }));

    setSortedChanges(ranked);
  };

  useEffect(() => {
    calculatePriorities();
  }, [changes, weights]);

  const handleWeightChange = (weight: keyof PriorityWeights, value: number) => {
    setWeights((prev) => ({ ...prev, [weight]: value }));
  };

  const resetWeights = () => {
    setWeights({
      revenueImprovement: 2.5,    // Highest - Revenue generation
      costSavings: 2.3,           // Very High - Cost reduction
      customerImpact: 2.2,        // Very High - Customer satisfaction
      processImprovement: 1.9,    // High - Operational efficiency
      internalQoL: 1.6,           // Medium-High - Employee satisfaction
      strategicAlignment: 2.0,    // High - Long-term goals
      urgency: 1.8,               // High - Time sensitivity
      impactScope: 1.5,           // Medium - Scale of change
      riskLevel: 1.4,             // Medium - Risk consideration
      resourceRequirement: 1.0,   // Low - Resources needed (inverse)
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-red-600 dark:text-red-400';
    if (score >= 6) return 'text-orange-600 dark:text-orange-400';
    if (score >= 4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-red-100 dark:bg-red-900';
    if (score >= 6) return 'bg-orange-100 dark:bg-orange-900';
    if (score >= 4) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-green-100 dark:bg-green-900';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm font-bold">
          🏆 #1
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-sm font-semibold">
        #{rank}
      </span>
    );
  };

  const factorLabels: Record<
    keyof PriorityFactors,
    { label: string; icon: any; help: string }
  > = {
    revenueImprovement: {
      label: 'Revenue Improvement',
      icon: PoundSterling,
      help: 'Expected revenue generation and growth',
    },
    costSavings: {
      label: 'Cost Savings',
      icon: TrendingUp,
      help: 'Expected cost reduction and savings',
    },
    customerImpact: {
      label: 'Customer Impact',
      icon: Users,
      help: 'Impact on customer satisfaction and retention',
    },
    processImprovement: {
      label: 'Process Improvement',
      icon: BarChart3,
      help: 'Operational efficiency and process optimization',
    },
    internalQoL: {
      label: 'Internal Quality of Life',
      icon: Users,
      help: 'Employee satisfaction and work experience',
    },
    strategicAlignment: {
      label: 'Strategic Alignment',
      icon: Zap,
      help: 'Alignment with long-term business goals',
    },
    urgency: {
      label: 'Urgency',
      icon: Clock,
      help: 'Time sensitivity and deadline pressure',
    },
    impactScope: {
      label: 'Impact Scope',
      icon: Users,
      help: 'Number of users/systems affected',
    },
    riskLevel: {
      label: 'Risk Level',
      icon: AlertTriangle,
      help: 'Risk and potential impact of failure',
    },
    resourceRequirement: {
      label: 'Resource Requirement',
      icon: Users,
      help: 'Resources needed (lower is better)',
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Benefit Assessment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Calculate business benefit scores based on configurable weighted factors
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowWeightConfig(!showWeightConfig)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {showWeightConfig ? 'Hide' : 'Configure'} Weights
          </button>
          <button
            onClick={calculatePriorities}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Recalculate
          </button>
        </div>
      </div>

      {/* Weight Configuration Panel */}
      {showWeightConfig && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Priority Weight Configuration
            </h2>
            <button
              onClick={resetWeights}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
            >
              Reset to Defaults
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {weights[key as keyof PriorityWeights].toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={weights[key as keyof PriorityWeights]}
                  onChange={(e) =>
                    handleWeightChange(
                      key as keyof PriorityWeights,
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Low (0.5)</span>
                  <span>High (3.0)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Queue */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Prioritized Change Queue
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Changes ranked by calculated priority score
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedChanges.map((change, index) => (
            <div
              key={change.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-start gap-4">
                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  {getRankBadge(change.priorityRank || index + 1)}
                </div>

                {/* Change Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {change.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {change.id} • {change.requester}
                      </p>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-lg ${getScoreBgColor(change.priorityScore || 0)}`}
                    >
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Priority Score
                      </p>
                      <p
                        className={`text-2xl font-bold ${getScoreColor(change.priorityScore || 0)}`}
                      >
                        {change.priorityScore?.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  {/* Factor Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {Object.entries(change.factors).map(([key, value]) => {
                      const { label, icon: Icon } =
                        factorLabels[key as keyof PriorityFactors];
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {label}:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {value}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded capitalize">
                      {change.type}
                    </span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded capitalize">
                      {change.riskLevel} Risk
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Target: {change.targetDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Rank Change Indicator */}
                {index === 0 && (
                  <div className="flex-shrink-0">
                    <div className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-lg flex items-center gap-1 text-xs font-semibold">
                      <ArrowUp className="w-3 h-3" />
                      Top Priority
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Changes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sortedChanges.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <Zap className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sortedChanges.filter((c) => (c.priorityScore || 0) >= 8).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Medium Priority</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {
                  sortedChanges.filter(
                    (c) => (c.priorityScore || 0) >= 6 && (c.priorityScore || 0) < 8
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(
                  sortedChanges.reduce((acc, c) => acc + (c.priorityScore || 0), 0) /
                  sortedChanges.length
                ).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitAssessment;
