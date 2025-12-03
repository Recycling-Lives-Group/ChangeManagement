import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
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
  Save,
} from 'lucide-react';
import { useChangesStore } from '../store/changesStore';
import { extractBenefitFactors } from '../lib/benefitCalculator';
import type { BenefitFactors, PriorityWeights } from '../lib/benefitCalculator';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ChangeRequest {
  id: string;
  title: string;
  eisenhowerQuadrant?: string;
  effortScore?: number;
  requester: string;
  submittedDate: Date;
  targetDate: Date;
  benefitScore?: number;
  benefitFactors?: BenefitFactors;
  priorityRank?: number;
  wizardData?: any;
}

interface PriorityFactors {
  revenueImprovement: number;
  costSavings: number;
  customerImpact: number;
  processImprovement: number;
  internalQoL: number;
  strategicAlignment: number;
  riskReduction: number;
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
    riskReduction: 1.7,         // High - Risk mitigation
  });
  const [benefitConfigs, setBenefitConfigs] = useState<Record<string, any>>({});
  const [showWeightConfig, setShowWeightConfig] = useState(false);
  const [sortedChanges, setSortedChanges] = useState<ChangeRequest[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch changes on mount
  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  // Load benefit configs on mount
  useEffect(() => {
    const loadBenefitConfigs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/benefit-config`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          // Convert array to keyed object
          const configsObj: Record<string, any> = {};
          response.data.data.forEach((config: any) => {
            configsObj[config.benefitType] = config;
          });
          setBenefitConfigs(configsObj);
        }
      } catch (error) {
        console.error('Failed to load benefit configs:', error);
        toast.error('Failed to load benefit scoring configuration');
      }
    };

    loadBenefitConfigs();
  }, []);

  // Convert store changes to prioritization format
  useEffect(() => {
    const convertedChanges: ChangeRequest[] = storeChanges
      .filter(change => change.status === 'approved')
      .map(change => {
        const wizardData = change.wizardData || {};

        // Calculate matrix quadrant based on benefit and effort
        const benefitScore = change.benefitScore || 0;
        const effortScore = change.effortScore || 0;

        console.log('Change:', change.requestNumber, 'Benefit:', benefitScore, 'Effort:', effortScore);

        let eisenhowerQuadrant = 'Must Do';

        if (benefitScore >= 50 && effortScore < 50) {
          eisenhowerQuadrant = 'Must Do'; // High Benefit, Low Effort
        } else if (benefitScore >= 50 && effortScore >= 50) {
          eisenhowerQuadrant = 'Strategic'; // High Benefit, High Effort
        } else if (benefitScore < 50 && effortScore >= 50) {
          eisenhowerQuadrant = 'Reconsider'; // Low Benefit, High Effort
        } else {
          eisenhowerQuadrant = 'Quick Fixes'; // Low Benefit, Low Effort
        }

        return {
          id: change.requestNumber || change.id,
          title: change.title,
          eisenhowerQuadrant,
          benefitScore,
          effortScore,
          requester: change.requester?.name || 'Unknown',
          submittedDate: change.submittedAt ? new Date(change.submittedAt) : new Date(),
          targetDate: wizardData.proposedDate ? new Date(wizardData.proposedDate) : new Date(),
          wizardData,
        };
      });

    setChanges(convertedChanges);
  }, [storeChanges]);

  const calculatePriorities = () => {
    if (changes.length === 0) {
      setSortedChanges([]);
      setHasCalculated(false);
      return;
    }

    if (Object.keys(benefitConfigs).length === 0) {
      return;
    }

    const changesWithScores = changes.map((change) => {
      // Use extractBenefitFactors to properly extract detailed benefit factors from wizardData
      const { factors, score } = extractBenefitFactors(change.wizardData || {}, weights, benefitConfigs);

      return {
        ...change,
        benefitScore: score,
        benefitFactors: factors,
      };
    });

    // Sort by score descending
    const sorted = changesWithScores.sort(
      (a, b) => (b.benefitScore || 0) - (a.benefitScore || 0)
    );

    // Add rank
    const ranked = sorted.map((change, index) => ({
      ...change,
      priorityRank: index + 1,
    }));

    setSortedChanges(ranked);
    setHasCalculated(true);
  };

  useEffect(() => {
    calculatePriorities();
  }, [changes, weights, benefitConfigs]);

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
      riskReduction: 1.7,         // High - Risk mitigation
    });
  };

  const saveToDatabase = async () => {
    if (!hasCalculated || sortedChanges.length === 0) {
      toast.error('Please calculate scores first');
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Authentication token not found');
      setIsSaving(false);
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    try {
      // Loop through all sorted changes and save each one's benefit score and factors
      for (const change of sortedChanges) {
        try {
          await axios.put(
            `${API_URL}/changes/${change.id}/benefit-score`,
            {
              benefitScore: change.benefitScore,
              benefitFactors: change.benefitFactors,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          successCount++;
        } catch (error) {
          console.error(`Failed to save benefit score for change ${change.id}:`, error);
          errorCount++;
        }
      }

      // Show result toast
      if (errorCount === 0) {
        toast.success(`Successfully saved benefit scores for ${successCount} change${successCount !== 1 ? 's' : ''}`);
      } else if (successCount > 0) {
        toast.success(`Saved ${successCount} scores, ${errorCount} failed`);
      } else {
        toast.error('Failed to save benefit scores');
      }

      // Refetch changes to get updated data
      await fetchChanges();
    } catch (error) {
      console.error('Error saving benefit scores:', error);
      toast.error('Failed to save benefit scores');
    } finally {
      setIsSaving(false);
    }
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
          #1
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-sm font-semibold">
        #{rank}
      </span>
    );
  };

  const factorLabels: Record<string, { label: string; icon: any; help: string }> = {
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
    riskReduction: {
      label: 'Risk Reduction',
      icon: AlertTriangle,
      help: 'Mitigation of risks and potential negative impacts',
    },
  };

  const renderFactorValue = (factor: any) => {
    if (!factor) return 'N/A';

    if (typeof factor === 'object') {
      if ('weightedScore' in factor) {
        return factor.weightedScore?.toFixed(1) || 'N/A';
      }
      if ('score' in factor) {
        return factor.score?.toFixed(1) || 'N/A';
      }
      if ('combinedScore' in factor) {
        return factor.combinedScore?.toFixed(1) || 'N/A';
      }
    }

    return typeof factor === 'number' ? factor.toFixed(1) : 'N/A';
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
          {hasCalculated && (
            <button
              onClick={saveToDatabase}
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save to Database'}
            </button>
          )}
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
            Changes ranked by calculated benefit score
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedChanges.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No changes available for assessment
            </div>
          ) : (
            sortedChanges.map((change, index) => (
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
                        className={`px-4 py-2 rounded-lg ${getScoreBgColor(change.benefitScore || 0)}`}
                      >
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Benefit Score
                        </p>
                        <p
                          className={`text-2xl font-bold ${getScoreColor(change.benefitScore || 0)}`}
                        >
                          {change.benefitScore?.toFixed(1) || '0.0'}
                        </p>
                      </div>
                    </div>

                    {/* Factor Breakdown */}
                    {change.benefitFactors && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Benefit Factor Scores:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(change.benefitFactors).map(([key, value]) => {
                            if (!value) return null;
                            const { label, icon: Icon } = factorLabels[key] || {
                              label: key,
                              icon: Info
                            };

                            // Extract score details from the factor object
                            let rawScore = 'N/A';
                            let weightedScore = 'N/A';

                            if (typeof value === 'object') {
                              // Try to get the raw score - different fields for different factor types
                              if ('combinedScore' in value) {
                                rawScore = value.combinedScore?.toFixed(1) || 'N/A';
                              } else if ('score' in value) {
                                rawScore = value.score?.toFixed(1) || 'N/A';
                              }

                              // Get weighted score
                              if ('weightedScore' in value) {
                                weightedScore = value.weightedScore?.toFixed(1) || 'N/A';
                              }
                            }

                            return (
                              <div
                                key={key}
                                className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Score: <span className="font-semibold text-gray-900 dark:text-white">{rawScore}</span>
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Weighted: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{weightedScore}</span>
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded capitalize">
                        {change.eisenhowerQuadrant}
                      </span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded">
                        Effort Score: {change.effortScore?.toFixed(0) || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Target: {change.targetDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Top Priority Indicator */}
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
            ))
          )}
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
                {sortedChanges.filter((c) => (c.benefitScore || 0) >= 8).length}
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
                    (c) => (c.benefitScore || 0) >= 6 && (c.benefitScore || 0) < 8
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
                {sortedChanges.length > 0
                  ? (
                      sortedChanges.reduce((acc, c) => acc + (c.benefitScore || 0), 0) /
                      sortedChanges.length
                    ).toFixed(1)
                  : '0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitAssessment;
