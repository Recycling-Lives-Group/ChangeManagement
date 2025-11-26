import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  PoundSterling,
  Users,
  Clock,
  Shield,
  TrendingUp,
  Info,
  Calculator,
  Settings,
  BarChart3,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { useChangesStore } from '../store/changesStore';
import { Link } from 'react-router-dom';

interface EffortFactors {
  // Risk Factors
  impactScope: number; // 1-5
  businessCritical: number; // 1-5
  complexity: number; // 1-5
  testingCoverage: number; // 1-5 (inverse - higher is better)
  rollbackCapability: number; // 1-5 (inverse - higher is better)
  historicalFailures: number; // 1-5

  // Impact Factors
  costToImplement: number; // 1-5
  timeToImplement: number; // 1-5
}

interface EffortWeights {
  // Risk Factors
  impactScope: number;
  businessCritical: number;
  complexity: number;
  testingCoverage: number;
  rollbackCapability: number;
  historicalFailures: number;

  // Impact Factors
  costToImplement: number;
  timeToImplement: number;
}

interface ChangeWithEffort {
  id: string;
  title: string;
  requestNumber: string;
  effortScore: number;
  effortLevel: string;
}

export const EffortAssessment: React.FC = () => {
  const { changes: storeChanges, fetchChanges } = useChangesStore();

  const [factors, setFactors] = useState<EffortFactors>({
    // Risk Factors
    impactScope: 3,
    businessCritical: 3,
    complexity: 3,
    testingCoverage: 3,
    rollbackCapability: 3,
    historicalFailures: 1,

    // Impact Factors
    costToImplement: 3,
    timeToImplement: 3,
  });

  const [weights, setWeights] = useState<EffortWeights>({
    // Risk Factors
    impactScope: 1.5,
    businessCritical: 1.8,
    complexity: 1.6,
    testingCoverage: 1.2,
    rollbackCapability: 1.4,
    historicalFailures: 1.7,

    // Impact Factors
    costToImplement: 2.0,
    timeToImplement: 1.9,
  });

  const [showWeights, setShowWeights] = useState(false);
  const [effortScore, setEffortScore] = useState(0);
  const [effortLevel, setEffortLevel] = useState('');
  const [changesWithEffort, setChangesWithEffort] = useState<ChangeWithEffort[]>([]);
  const [editingChangeId, setEditingChangeId] = useState<string | null>(null);
  const [manualScore, setManualScore] = useState<number>(50);

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  useEffect(() => {
    calculateEffort();
  }, [factors, weights]);

  useEffect(() => {
    calculateChangesEffort();
  }, [storeChanges, weights]);

  const calculateEffort = () => {
    // Calculate weighted score
    let totalScore = 0;
    let totalWeight = 0;

    Object.keys(factors).forEach((key) => {
      const factorKey = key as keyof EffortFactors;
      let factorValue = factors[factorKey];

      // Inverse scoring for positive factors
      if (factorKey === 'testingCoverage' || factorKey === 'rollbackCapability') {
        factorValue = 6 - factorValue;
      }

      totalScore += factorValue * weights[factorKey];
      totalWeight += weights[factorKey];
    });

    const normalizedScore = (totalScore / totalWeight) * 20; // Scale to 0-100
    setEffortScore(Math.round(normalizedScore));

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
    setEffortLevel(level);
  };

  const calculateChangesEffort = () => {
    const changesWithScores = storeChanges
      .filter(change => change.status !== 'rejected' && change.status !== 'cancelled' && change.status !== 'completed')
      .map(change => {
        // Check if there's a stored effort score (check both possible field names)
        const storedScore = (change as any).effort_score ?? change.effortScore;

        if (storedScore !== undefined && storedScore !== null) {
          // Use the stored score
          console.log(`Using stored score for ${change.title}:`, storedScore);
          let level = '';
          if (storedScore < 25) level = 'Low';
          else if (storedScore < 50) level = 'Medium';
          else if (storedScore < 75) level = 'High';
          else level = 'Very High';

          return {
            id: change.id,
            title: change.title,
            requestNumber: change.requestNumber || change.id,
            effortScore: storedScore,
            effortLevel: level,
          };
        }

        console.log(`Auto-calculating score for ${change.title}`);

        // Otherwise, auto-calculate effort factors from wizard data
        const wizardData = change.wizardData || {};
        const autoFactors: EffortFactors = {
          impactScope: Math.min(5, Math.ceil((Number(wizardData.impactedUsers) || 10) / 50)),
          businessCritical: wizardData.urgencyLevel === 'high' ? 4 : wizardData.urgencyLevel === 'medium' ? 3 : 2,
          complexity: Math.min(5, Math.ceil((Number(wizardData.estimatedEffortHours) || 10) / 40)),
          testingCoverage: 3, // Default middle value
          rollbackCapability: 3, // Default middle value
          historicalFailures: 1, // Default low value
          costToImplement: Math.min(5, Math.ceil((Number(wizardData.estimatedCost) || 1000) / 2000)),
          timeToImplement: Math.min(5, Math.ceil((Number(wizardData.estimatedEffortHours) || 10) / 40)),
        };

        // Calculate effort score
        let totalScore = 0;
        let totalWeight = 0;

        Object.keys(autoFactors).forEach((key) => {
          const factorKey = key as keyof EffortFactors;
          let factorValue = autoFactors[factorKey];

          // Inverse scoring for positive factors
          if (factorKey === 'testingCoverage' || factorKey === 'rollbackCapability') {
            factorValue = 6 - factorValue;
          }

          totalScore += factorValue * weights[factorKey];
          totalWeight += weights[factorKey];
        });

        const normalizedScore = (totalScore / totalWeight) * 20;
        const score = Math.round(normalizedScore);

        let level = '';
        if (score < 25) level = 'Low';
        else if (score < 50) level = 'Medium';
        else if (score < 75) level = 'High';
        else level = 'Very High';

        return {
          id: change.id,
          title: change.title,
          requestNumber: change.requestNumber || change.id,
          effortScore: score,
          effortLevel: level,
        };
      })
      .sort((a, b) => b.effortScore - a.effortScore);

    setChangesWithEffort(changesWithScores);
  };

  const handleFactorChange = (factor: keyof EffortFactors, value: number) => {
    setFactors((prev) => ({ ...prev, [factor]: value }));
  };

  const handleWeightChange = (weight: keyof EffortWeights, value: number) => {
    setWeights((prev) => ({ ...prev, [weight]: value }));
  };

  const resetToDefaults = () => {
    setFactors({
      impactScope: 3,
      businessCritical: 3,
      complexity: 3,
      testingCoverage: 3,
      rollbackCapability: 3,
      historicalFailures: 1,
      costToImplement: 3,
      timeToImplement: 3,
    });
    setWeights({
      impactScope: 1.5,
      businessCritical: 1.8,
      complexity: 1.6,
      testingCoverage: 1.2,
      rollbackCapability: 1.4,
      historicalFailures: 1.7,
      costToImplement: 2.0,
      timeToImplement: 1.9,
    });
  };

  const handleEditScore = (changeId: string, currentScore: number) => {
    setEditingChangeId(changeId);
    setManualScore(currentScore);
  };

  const handleSaveManualScore = async (changeId: string) => {
    try {
      // Save to backend
      const { updateChange } = useChangesStore.getState();
      await updateChange(changeId, {
        effort_score: manualScore,
        effort_calculated_at: new Date().toISOString(),
      });

      // Refresh the changes list
      await fetchChanges();

      // Update the score in the local list
      setChangesWithEffort(prev => prev.map(change => {
        if (change.id === changeId) {
          let level = '';
          if (manualScore < 25) level = 'Low';
          else if (manualScore < 50) level = 'Medium';
          else if (manualScore < 75) level = 'High';
          else level = 'Very High';

          return {
            ...change,
            effortScore: manualScore,
            effortLevel: level,
          };
        }
        return change;
      }).sort((a, b) => b.effortScore - a.effortScore));

      setEditingChangeId(null);
    } catch (error) {
      console.error('Failed to save effort score:', error);
      alert('Failed to save effort score. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingChangeId(null);
  };

  const getEffortColor = () => {
    switch (effortLevel) {
      case 'Low':
        return 'text-green-600 dark:text-green-400';
      case 'Medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'High':
        return 'text-orange-600 dark:text-orange-400';
      case 'Very High':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getEffortBgColor = () => {
    switch (effortLevel) {
      case 'Low':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'Medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'High':
        return 'bg-orange-100 dark:bg-orange-900/20';
      case 'Very High':
        return 'bg-red-100 dark:bg-red-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getEffortBadgeColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
      case 'Very High':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300';
    }
  };

  const riskFactorLabels: Record<string, { label: string; icon: any; help: string }> = {
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
    historicalFailures: {
      label: 'Historical Failures',
      icon: AlertTriangle,
      help: 'Past failure rate for similar changes (1=none, 5=frequent)',
    },
  };

  const impactFactorLabels: Record<string, { label: string; icon: any; help: string }> = {
    costToImplement: {
      label: 'Cost to Implement',
      icon: PoundSterling,
      help: 'Financial cost of implementation (1=minimal, 5=very high)',
    },
    timeToImplement: {
      label: 'Time to Implement',
      icon: Clock,
      help: 'Time required for implementation (1=quick, 5=lengthy)',
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Effort Assessment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Calculate implementation effort combining risk and impact factors
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowWeights(!showWeights)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {showWeights ? 'Hide' : 'Configure'} Weights
          </button>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Reset Defaults
          </button>
          <button
            onClick={calculateEffort}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Recalculate
          </button>
        </div>
      </div>

      {/* Weight Configuration Panel */}
      {showWeights && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Weight Configuration
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Adjust the importance (weight) of each factor in the effort calculation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Factors */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Risk Factors</h3>
              <div className="space-y-3">
                {Object.keys(riskFactorLabels).map((key) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{riskFactorLabels[key].label}</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {weights[key as keyof EffortWeights].toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={weights[key as keyof EffortWeights]}
                      onChange={(e) => handleWeightChange(key as keyof EffortWeights, parseFloat(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Factors */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Impact Factors</h3>
              <div className="space-y-3">
                {Object.keys(impactFactorLabels).map((key) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{impactFactorLabels[key].label}</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {weights[key as keyof EffortWeights].toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={weights[key as keyof EffortWeights]}
                      onChange={(e) => handleWeightChange(key as keyof EffortWeights, parseFloat(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Effort Factors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Factors Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Risk Factors
            </h2>
            <div className="space-y-6">
              {Object.entries(riskFactorLabels).map(([key, { label, icon: Icon, help }]) => (
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
                      {factors[key as keyof EffortFactors]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={factors[key as keyof EffortFactors]}
                    onChange={(e) =>
                      handleFactorChange(
                        key as keyof EffortFactors,
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Low (1)</span>
                    <span>High (5)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Factors Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Implementation Impact
            </h2>
            <div className="space-y-6">
              {Object.entries(impactFactorLabels).map(([key, { label, icon: Icon, help }]) => (
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
                      {factors[key as keyof EffortFactors]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={factors[key as keyof EffortFactors]}
                    onChange={(e) =>
                      handleFactorChange(
                        key as keyof EffortFactors,
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Low (1)</span>
                    <span>High (5)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Effort Score Card */}
          <div className={`${getEffortBgColor()} p-6 rounded-lg shadow border-2 ${effortLevel === 'Low' ? 'border-green-300 dark:border-green-700' : effortLevel === 'Medium' ? 'border-yellow-300 dark:border-yellow-700' : effortLevel === 'High' ? 'border-orange-300 dark:border-orange-700' : 'border-red-300 dark:border-red-700'}`}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Effort Score
            </h2>
            <div className="text-center">
              <div className={`text-6xl font-bold ${getEffortColor()} mb-2`}>
                {effortScore}
              </div>
              <div className={`text-2xl font-semibold ${getEffortColor()}`}>
                {effortLevel}
              </div>
              <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                Score Range: 0-100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Changes with Effort Scores */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Change Requests by Effort
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Automatically calculated effort scores for all active change requests
          </p>
        </div>
        <div className="p-6">
          {changesWithEffort.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No active change requests found
            </p>
          ) : (
            <div className="space-y-3">
              {changesWithEffort.map((change, index) => (
                <div
                  key={change.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  {editingChangeId === change.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400 dark:text-gray-600">
                          #{index + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {change.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {change.requestNumber}
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Manual Effort Score: {manualScore}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={manualScore}
                          onChange={(e) => setManualScore(parseInt(e.target.value))}
                          className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
                        />
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                          <span>Low (0)</span>
                          <span>Medium (25-50)</span>
                          <span>High (50-75)</span>
                          <span>Very High (75-100)</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveManualScore(change.id)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Save Score
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/changes/${change.id}`}
                        className="flex-1 flex items-center gap-3 hover:opacity-80 transition"
                      >
                        <span className="text-lg font-bold text-gray-400 dark:text-gray-600">
                          #{index + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {change.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {change.requestNumber}
                          </p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${change.effortLevel === 'Low' ? 'text-green-600' : change.effortLevel === 'Medium' ? 'text-yellow-600' : change.effortLevel === 'High' ? 'text-orange-600' : 'text-red-600'}`}>
                            {change.effortScore}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEffortBadgeColor(change.effortLevel)}`}>
                          {change.effortLevel}
                        </span>
                        <button
                          onClick={() => handleEditScore(change.id, change.effortScore)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                          title="Edit effort score"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EffortAssessment;
