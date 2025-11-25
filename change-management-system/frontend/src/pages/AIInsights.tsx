import React, { useState } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
  Activity,
  BarChart3,
  MessageSquare,
  Sparkles,
  Shield,
  Clock,
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'prediction' | 'recommendation' | 'anomaly' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  confidence: number;
  impact: string;
  suggestedAction?: string;
  relatedChanges?: string[];
}

interface PredictiveModel {
  name: string;
  accuracy: number;
  lastTrained: Date;
  predictions: number;
}

const sampleInsights: Insight[] = [
  {
    id: 'ins-1',
    type: 'prediction',
    priority: 'high',
    title: 'High Change Volume Expected Next Week',
    description:
      'Based on historical patterns, we predict 35% increase in change requests next week due to upcoming release cycle.',
    confidence: 87,
    impact: 'Resource allocation may need adjustment',
    suggestedAction: 'Schedule additional CAB members and increase approval capacity',
    relatedChanges: ['CR-2025-045', 'CR-2025-046'],
  },
  {
    id: 'ins-2',
    type: 'anomaly',
    priority: 'high',
    title: 'Unusual Failure Rate Detected',
    description:
      'Database-related changes have shown a 45% failure rate in the last 2 weeks, significantly above the baseline of 8%.',
    confidence: 94,
    impact: 'Potential systemic issue requiring investigation',
    suggestedAction: 'Review database change procedures and conduct root cause analysis',
    relatedChanges: ['CR-2025-032', 'CR-2025-038', 'CR-2025-041'],
  },
  {
    id: 'ins-3',
    type: 'recommendation',
    priority: 'medium',
    title: 'Optimize Change Windows',
    description:
      'Analysis shows that changes implemented on Tuesday afternoons have 15% higher success rates compared to other time slots.',
    confidence: 78,
    impact: 'Could improve overall success rate by 3-5%',
    suggestedAction: 'Encourage teams to schedule critical changes for Tuesday 2-5pm',
  },
  {
    id: 'ins-4',
    type: 'optimization',
    priority: 'medium',
    title: 'Automate Standard Change Approvals',
    description:
      '68% of standard changes follow identical patterns and could be auto-approved, saving approximately 12 hours per week.',
    confidence: 91,
    impact: 'Significant time savings and faster throughput',
    suggestedAction: 'Create automation rules for low-risk standard changes',
  },
  {
    id: 'ins-5',
    type: 'prediction',
    priority: 'high',
    title: 'Potential SLA Breach Alert',
    description:
      'CR-2025-048 has a 73% probability of missing its SLA deadline based on current progress and historical data.',
    confidence: 73,
    impact: 'SLA breach and potential customer impact',
    suggestedAction: 'Escalate to senior team member and allocate additional resources',
    relatedChanges: ['CR-2025-048'],
  },
  {
    id: 'ins-6',
    type: 'recommendation',
    priority: 'low',
    title: 'Enhanced Testing Coverage',
    description:
      'Changes with comprehensive test coverage (>80%) have 92% success rate vs. 67% for those with <50% coverage.',
    confidence: 89,
    impact: 'Improved success rates across all change types',
    suggestedAction: 'Implement mandatory test coverage requirements for major changes',
  },
  {
    id: 'ins-7',
    type: 'anomaly',
    priority: 'medium',
    title: 'Increased Emergency Changes',
    description:
      'Emergency change requests have increased by 40% this month compared to historical average.',
    confidence: 82,
    impact: 'May indicate underlying issues or inadequate planning',
    suggestedAction: 'Review change planning processes and conduct trend analysis',
  },
  {
    id: 'ins-8',
    type: 'optimization',
    priority: 'low',
    title: 'Consolidate Related Changes',
    description:
      'Identified 8 changes that could be combined into 2 larger changes, reducing approval overhead and implementation time.',
    confidence: 76,
    impact: 'Reduced complexity and faster delivery',
    suggestedAction: 'Review and consolidate related changes before approval',
    relatedChanges: ['CR-2025-049', 'CR-2025-050', 'CR-2025-051'],
  },
];

const models: PredictiveModel[] = [
  { name: 'Change Success Predictor', accuracy: 89.5, lastTrained: new Date(2025, 10, 20), predictions: 1245 },
  { name: 'Risk Assessment AI', accuracy: 92.3, lastTrained: new Date(2025, 10, 22), predictions: 856 },
  { name: 'SLA Breach Detector', accuracy: 87.8, lastTrained: new Date(2025, 10, 23), predictions: 432 },
  { name: 'Resource Optimizer', accuracy: 84.2, lastTrained: new Date(2025, 10, 21), predictions: 678 },
];

export const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>(sampleInsights);
  const [selectedType, setSelectedType] = useState<'all' | string>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | string>('all');

  const filteredInsights = insights.filter((insight) => {
    if (selectedType !== 'all' && insight.type !== selectedType) return false;
    if (selectedPriority !== 'all' && insight.priority !== selectedPriority) return false;
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction':
        return TrendingUp;
      case 'recommendation':
        return Lightbulb;
      case 'anomaly':
        return AlertTriangle;
      case 'optimization':
        return Target;
      default:
        return Activity;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      prediction: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      recommendation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      anomaly: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      optimization: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return colors[type as keyof typeof colors];
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return config[priority as keyof typeof config];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            AI-Powered Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Machine learning insights and predictive analytics for smarter decision-making
          </p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Generate New Insights
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow text-white">
          <Brain className="w-8 h-8 mb-2 opacity-90" />
          <p className="text-3xl font-bold">{insights.length}</p>
          <p className="text-sm opacity-90">Active Insights</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow text-white">
          <Target className="w-8 h-8 mb-2 opacity-90" />
          <p className="text-3xl font-bold">89.2%</p>
          <p className="text-sm opacity-90">Avg Model Accuracy</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow text-white">
          <Zap className="w-8 h-8 mb-2 opacity-90" />
          <p className="text-3xl font-bold">3,211</p>
          <p className="text-sm opacity-90">Predictions Made</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow text-white">
          <Activity className="w-8 h-8 mb-2 opacity-90" />
          <p className="text-3xl font-bold">24h</p>
          <p className="text-sm opacity-90">Time Saved This Week</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Filter by Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  selectedType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                All
              </button>
              {['prediction', 'recommendation', 'anomaly', 'optimization'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-lg text-sm capitalize ${
                    selectedType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Filter by Priority
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPriority('all')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  selectedPriority === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                All
              </button>
              {['high', 'medium', 'low'].map((priority) => (
                <button
                  key={priority}
                  onClick={() => setSelectedPriority(priority)}
                  className={`px-3 py-1 rounded-lg text-sm capitalize ${
                    selectedPriority === priority
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInsights.map((insight) => {
          const Icon = getTypeIcon(insight.type);
          return (
            <div
              key={insight.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${getTypeColor(insight.type)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold capitalize ${getTypeColor(
                          insight.type
                        )}`}
                      >
                        {insight.type}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getPriorityBadge(
                      insight.priority
                    )}`}
                  >
                    {insight.priority}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {insight.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {insight.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            insight.confidence >= 80
                              ? 'bg-green-500'
                              : insight.confidence >= 60
                              ? 'bg-yellow-500'
                              : 'bg-orange-500'
                          }`}
                          style={{ width: `${insight.confidence}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {insight.confidence}%
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">
                      IMPACT
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">{insight.impact}</p>
                  </div>

                  {insight.suggestedAction && (
                    <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <p className="text-xs font-semibold text-green-800 dark:text-green-200 mb-1">
                        SUGGESTED ACTION
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {insight.suggestedAction}
                      </p>
                    </div>
                  )}

                  {insight.relatedChanges && insight.relatedChanges.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Related:</span>
                      {insight.relatedChanges.map((changeId) => (
                        <span
                          key={changeId}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-mono"
                        >
                          {changeId}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                    Take Action
                  </button>
                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ML Models Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Machine Learning Models
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {models.map((model, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {model.name}
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {model.accuracy}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Predictions:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {model.predictions.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  Last trained: {model.lastTrained.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Chat Assistant */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-lg shadow text-white">
        <div className="flex items-start gap-4">
          <MessageSquare className="w-12 h-12 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
            <p className="mb-4 opacity-90">
              Ask questions about your change management data and get instant AI-powered insights
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask me anything about your changes..."
                className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-20 placeholder-white placeholder-opacity-70 text-white border-none focus:ring-2 focus:ring-white"
              />
              <button className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-semibold">
                Ask
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
