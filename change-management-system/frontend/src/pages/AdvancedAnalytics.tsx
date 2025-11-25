import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Clock,
  Users,
  Target,
  Percent,
  Calendar,
  DollarSign,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Advanced Analytics Data
const performanceMetrics = [
  { month: 'Jan', onTime: 85, delayed: 15, cancelled: 5, mttr: 2.5 },
  { month: 'Feb', onTime: 88, delayed: 12, cancelled: 3, mttr: 2.2 },
  { month: 'Mar', onTime: 92, delayed: 8, cancelled: 2, mttr: 1.8 },
  { month: 'Apr', onTime: 90, delayed: 10, cancelled: 3, mttr: 2.0 },
  { month: 'May', onTime: 94, delayed: 6, cancelled: 1, mttr: 1.5 },
  { month: 'Jun', onTime: 96, delayed: 4, cancelled: 1, mttr: 1.3 },
];

const riskVsImpactData = [
  { risk: 8, impact: 9, size: 400, name: 'CR-001', type: 'emergency' },
  { risk: 7, impact: 8, size: 300, name: 'CR-002', type: 'major' },
  { risk: 5, impact: 6, size: 200, name: 'CR-003', type: 'major' },
  { risk: 3, impact: 4, size: 150, name: 'CR-004', type: 'minor' },
  { risk: 2, impact: 3, size: 100, name: 'CR-005', type: 'standard' },
  { risk: 9, impact: 10, size: 500, name: 'CR-006', type: 'emergency' },
  { risk: 6, impact: 7, size: 250, name: 'CR-007', type: 'major' },
  { risk: 4, impact: 5, size: 180, name: 'CR-008', type: 'minor' },
];

const teamProductivityData = [
  { team: 'Infrastructure', velocity: 85, quality: 92, efficiency: 88 },
  { team: 'Development', velocity: 90, quality: 88, efficiency: 91 },
  { team: 'Security', velocity: 78, quality: 95, efficiency: 82 },
  { team: 'Operations', velocity: 88, quality: 90, efficiency: 89 },
  { team: 'Database', velocity: 82, quality: 93, efficiency: 85 },
];

const changeVolumeByDay = [
  { day: 'Mon', volume: 12, avg: 10 },
  { day: 'Tue', volume: 15, avg: 10 },
  { day: 'Wed', volume: 18, avg: 10 },
  { day: 'Thu', volume: 14, avg: 10 },
  { day: 'Fri', volume: 8, avg: 10 },
  { day: 'Sat', volume: 3, avg: 10 },
  { day: 'Sun', volume: 2, avg: 10 },
];

const costAnalysisData = [
  { month: 'Jan', planned: 45000, actual: 48000, saved: 5000 },
  { month: 'Feb', planned: 52000, actual: 50000, saved: 8000 },
  { month: 'Mar', planned: 48000, actual: 47000, saved: 12000 },
  { month: 'Apr', planned: 55000, actual: 53000, saved: 15000 },
  { month: 'May', planned: 50000, actual: 48000, saved: 18000 },
  { month: 'Jun', planned: 58000, actual: 55000, saved: 22000 },
];

const failureAnalysisData = [
  { category: 'Insufficient Testing', count: 45, percentage: 30 },
  { category: 'Poor Planning', count: 30, percentage: 20 },
  { category: 'Dependencies', count: 27, percentage: 18 },
  { category: 'Technical Issues', count: 24, percentage: 16 },
  { category: 'Communication', count: 18, percentage: 12 },
  { category: 'Other', count: 6, percentage: 4 },
];

export const AdvancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '6m' | '1y'>('6m');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Advanced Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Deep insights and predictive analytics for change management
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-2 rounded-lg ${
              timeRange === '30d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-4 py-2 rounded-lg ${
              timeRange === '90d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            90 Days
          </button>
          <button
            onClick={() => setTimeRange('6m')}
            className={`px-4 py-2 rounded-lg ${
              timeRange === '6m'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            6 Months
          </button>
          <button
            onClick={() => setTimeRange('1y')}
            className={`px-4 py-2 rounded-lg ${
              timeRange === '1y'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            1 Year
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">96%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">On-Time Delivery</p>
          <p className="text-xs text-green-600 mt-1">+4% from last period</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <TrendingDown className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">1.3h</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Mean Time to Restore</p>
          <p className="text-xs text-green-600 mt-1">-0.5h improvement</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <Percent className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">98.5%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
          <p className="text-xs text-green-600 mt-1">+2.3% increase</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            <TrendingDown className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">1.5%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Failure Rate</p>
          <p className="text-xs text-green-600 mt-1">-0.8% reduction</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">£22K</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Cost Savings</p>
          <p className="text-xs text-green-600 mt-1">+47% increase</p>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Delivery Performance Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="onTime"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.8}
                name="On Time %"
              />
              <Area
                type="monotone"
                dataKey="delayed"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.8}
                name="Delayed %"
              />
              <Area
                type="monotone"
                dataKey="cancelled"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.8}
                name="Cancelled %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Mean Time to Restore (Hours)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="mttr"
                stroke="#3b82f6"
                strokeWidth={3}
                name="MTTR"
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Risk vs Impact Matrix
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                type="number"
                dataKey="risk"
                name="Risk"
                stroke="#9ca3af"
                label={{ value: 'Risk Level', position: 'bottom', fill: '#9ca3af' }}
                domain={[0, 10]}
              />
              <YAxis
                type="number"
                dataKey="impact"
                name="Impact"
                stroke="#9ca3af"
                label={{
                  value: 'Business Impact',
                  angle: -90,
                  position: 'left',
                  fill: '#9ca3af',
                }}
                domain={[0, 10]}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Scatter name="Changes" data={riskVsImpactData} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Team Performance Radar
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={teamProductivityData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="team" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar
                name="Velocity"
                dataKey="velocity"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
              <Radar
                name="Quality"
                dataKey="quality"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.5}
              />
              <Radar
                name="Efficiency"
                dataKey="efficiency"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.5}
              />
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volume and Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Change Volume by Day of Week
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={changeVolumeByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="volume" fill="#3b82f6" name="Actual Volume" radius={[8, 8, 0, 0]} />
              <Bar dataKey="avg" fill="#6b7280" name="Average" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cost Analysis & Savings
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={costAnalysisData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="planned"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Planned Cost"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Actual Cost"
              />
              <Line
                type="monotone"
                dataKey="saved"
                stroke="#10b981"
                strokeWidth={2}
                name="Cumulative Savings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Failure Analysis */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Root Cause Analysis - Change Failures
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {failureAnalysisData.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-red-500"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">{item.category}</h4>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-xs font-bold">
                  {item.percentage}%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {item.count}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Incidents</p>
              <div className="mt-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${item.percentage * 3.33}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg shadow text-white">
        <div className="flex items-start gap-4">
          <Activity className="w-12 h-12 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Predictive Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <p className="text-sm opacity-90 mb-1">Next Week Forecast</p>
                <p className="text-2xl font-bold">18 changes</p>
                <p className="text-xs opacity-75 mt-1">+20% from average</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <p className="text-sm opacity-90 mb-1">High Risk Alert</p>
                <p className="text-2xl font-bold">3 changes</p>
                <p className="text-xs opacity-75 mt-1">Require extra review</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <p className="text-sm opacity-90 mb-1">Capacity Status</p>
                <p className="text-2xl font-bold">78%</p>
                <p className="text-xs opacity-75 mt-1">Optimal workload</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
