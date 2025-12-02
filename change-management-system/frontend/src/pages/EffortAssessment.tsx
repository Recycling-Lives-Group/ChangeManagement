import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Calculator,
  Clock,
  Users,
  Settings,
  BarChart3,
  Save,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useChangesStore } from '../store/changesStore';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface EffortWeights {
  hoursEstimated: number;
  costEstimated: number;
  teamSize: number;
  complexity: number;
  systemsAffected: number;
  testingRequired: number;
  documentationRequired: number;
}

interface ChangeRequest {
  id: string;
  title: string;
  requestNumber: string;
  effortScore?: number;
  effortRank?: number;
  wizardData?: any;
}

export const EffortAssessment: React.FC = () => {
  const { changes: storeChanges, fetchChanges } = useChangesStore();
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [weights, setWeights] = useState<EffortWeights>({
    hoursEstimated: 2.0,         // Most important
    costEstimated: 1.8,          // Very High
    teamSize: 1.5,               // Medium-High
    complexity: 1.6,             // High
    systemsAffected: 1.3,        // Medium
    testingRequired: 1.2,        // Medium
    documentationRequired: 1.0,  // Lower
  });
  const [showWeightConfig, setShowWeightConfig] = useState(false);
  const [sortedChanges, setSortedChanges] = useState<ChangeRequest[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch changes on mount
  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  // Update local changes when store changes
  useEffect(() => {
    const activeChanges = storeChanges.filter(
      (change) => change.status !== 'rejected' && change.status !== 'cancelled' && change.status !== 'completed'
    ) as ChangeRequest[];
    setChanges(activeChanges);
  }, [storeChanges]);

  // Auto-calculate on changes load
  useEffect(() => {
    if (changes.length > 0 && !hasCalculated) {
      const changesWithEffort = changes
        .map((change) => {
          const effortScore = calculateEffortScore(change.wizardData || {});
          return {
            ...change,
            effortScore,
          };
        })
        .sort((a, b) => (b.effortScore || 0) - (a.effortScore || 0))
        .map((change, index) => ({
          ...change,
          effortRank: index + 1,
        }));

      setSortedChanges(changesWithEffort);
      setHasCalculated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changes]);

  const calculateEffortScore = (wizardData: any): number => {
    // Extract effort factors from wizard data
    const hoursEstimated = Number(wizardData.estimatedEffortHours) || 0;
    const costStr = wizardData.estimatedCost?.toString().replace(/[£,]/g, '') || '0';
    const costEstimated = parseFloat(costStr);
    const teamSize = Number(wizardData.teamSize) || 1;
    const complexity = Number(wizardData.complexity) || inferComplexity(hoursEstimated);
    const systemsAffected = Array.isArray(wizardData.systemsAffected) ? wizardData.systemsAffected.length : 0;
    const testingRequired = Number(wizardData.testingRequired) || 3;
    const documentationRequired = Number(wizardData.documentationRequired) || 3;

    // Normalize to 0-100 scale and apply weights
    const hoursScore = normalizeToScale(hoursEstimated, [0, 40, 160, 400, 1000]);
    const costScore = normalizeToScale(costEstimated, [0, 1000, 5000, 20000, 50000]);
    const teamScore = normalizeToScale(teamSize, [1, 2, 4, 6, 9]);
    const complexityScore = (complexity - 1) * 25;
    const systemsScore = normalizeToScale(systemsAffected, [0, 1, 2, 4, 5]);
    const testingScore = (testingRequired - 1) * 25;
    const documentationScore = (documentationRequired - 1) * 25;

    let totalScore = 0;
    let totalWeight = 0;

    totalScore += hoursScore * weights.hoursEstimated;
    totalWeight += weights.hoursEstimated;

    totalScore += costScore * weights.costEstimated;
    totalWeight += weights.costEstimated;

    totalScore += teamScore * weights.teamSize;
    totalWeight += weights.teamSize;

    totalScore += complexityScore * weights.complexity;
    totalWeight += weights.complexity;

    totalScore += systemsScore * weights.systemsAffected;
    totalWeight += weights.systemsAffected;

    totalScore += testingScore * weights.testingRequired;
    totalWeight += weights.testingRequired;

    totalScore += documentationScore * weights.documentationRequired;
    totalWeight += weights.documentationRequired;

    const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    return Math.round(normalizedScore);
  };

  const normalizeToScale = (value: number, thresholds: number[]): number => {
    if (value <= thresholds[0]) return 0;
    if (value <= thresholds[1]) return 25;
    if (value <= thresholds[2]) return 50;
    if (value <= thresholds[3]) return 75;
    if (value <= thresholds[4]) return 90;
    return 100;
  };

  const inferComplexity = (hours: number): number => {
    if (hours < 8) return 1;
    if (hours < 40) return 2;
    if (hours < 160) return 3;
    if (hours < 400) return 4;
    return 5;
  };

  const calculateEffort = () => {
    const changesWithEffort = changes
      .map((change) => {
        const effortScore = calculateEffortScore(change.wizardData || {});
        return {
          ...change,
          effortScore,
        };
      })
      .sort((a, b) => (b.effortScore || 0) - (a.effortScore || 0))
      .map((change, index) => ({
        ...change,
        effortRank: index + 1,
      }));

    setSortedChanges(changesWithEffort);
    setHasCalculated(true);
    toast.success('Effort scores calculated successfully!');
  };

  const saveToDatabase = async () => {
    if (sortedChanges.length === 0) {
      toast.error('No changes to save');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const updates = sortedChanges.map((change) => ({
        id: change.id,
        effort_score: change.effortScore,
        effort_calculated_at: new Date().toISOString(),
      }));

      await Promise.all(
        updates.map((update) =>
          axios.put(`${API_URL}/changes/${update.id}`, update, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      toast.success(`Saved effort scores for ${updates.length} change requests!`);
      await fetchChanges();
    } catch (error) {
      console.error('Failed to save effort scores:', error);
      toast.error('Failed to save effort scores to database');
    } finally {
      setIsSaving(false);
    }
  };

  const handleWeightChange = (key: keyof EffortWeights, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
    setHasCalculated(false); // Mark as needing recalculation
  };

  const getEffortLevel = (score: number): string => {
    if (score < 25) return 'Low';
    if (score < 50) return 'Medium';
    if (score < 75) return 'High';
    return 'Very High';
  };

  const getEffortColor = (score: number): string => {
    const level = getEffortLevel(score);
    switch (level) {
      case 'Low':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'Medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'High':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      case 'Very High':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const weightLabels: Record<keyof EffortWeights, { label: string; description: string }> = {
    hoursEstimated: {
      label: 'Hours Estimated',
      description: 'Estimated hours to complete the change',
    },
    costEstimated: {
      label: 'Cost Estimated',
      description: 'Estimated financial cost in £',
    },
    teamSize: {
      label: 'Team Size',
      description: 'Number of people required',
    },
    complexity: {
      label: 'Complexity',
      description: 'Technical complexity (1-5 scale)',
    },
    systemsAffected: {
      label: 'Systems Affected',
      description: 'Number of systems impacted',
    },
    testingRequired: {
      label: 'Testing Required',
      description: 'Level of testing needed (1-5 scale)',
    },
    documentationRequired: {
      label: 'Documentation Required',
      description: 'Level of documentation needed (1-5 scale)',
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
            Calculate implementation effort scores based on configurable weighted factors
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
            onClick={calculateEffort}
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
              Effort Factor Weights
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Adjust the importance (weight) of each factor in the effort calculation. Higher weights mean that factor has more influence on the final effort score.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(weightLabels).map(([key, { label, description }]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </label>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {weights[key as keyof EffortWeights].toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={weights[key as keyof EffortWeights]}
                  onChange={(e) => handleWeightChange(key as keyof EffortWeights, parseFloat(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Low (0.5)</span>
                  <span>High (3.0)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Effort Summary */}
      {hasCalculated && sortedChanges.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg shadow border-2 border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Effort Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Changes</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{sortedChanges.length}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Low Effort</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {sortedChanges.filter((c) => (c.effortScore || 0) < 25).length}
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Medium Effort</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {sortedChanges.filter((c) => (c.effortScore || 0) >= 25 && (c.effortScore || 0) < 50).length}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">High+ Effort</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {sortedChanges.filter((c) => (c.effortScore || 0) >= 50).length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Effort Ranked Changes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Effort-Ranked Change Requests
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {hasCalculated
              ? 'Changes sorted by effort score (highest to lowest)'
              : 'Click "Recalculate" to compute effort scores'}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Change Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Effort Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {!hasCalculated ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No effort scores calculated yet</p>
                    <p className="text-sm mt-1">Click "Recalculate" to compute effort scores for all changes</p>
                  </td>
                </tr>
              ) : sortedChanges.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    No active change requests found
                  </td>
                </tr>
              ) : (
                sortedChanges.map((change) => (
                  <tr key={change.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl font-bold text-gray-400 dark:text-gray-600">
                        #{change.effortRank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {change.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {change.requestNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {change.effortScore}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEffortColor(change.effortScore || 0)}`}>
                        {getEffortLevel(change.effortScore || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/changes/${change.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EffortAssessment;
