import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';

// Sample data - will be replaced with real API data
const statusDistributionData = [
  { name: 'New', value: 12, color: '#3b82f6' },
  { name: 'In Review', value: 8, color: '#f59e0b' },
  { name: 'Approved', value: 15, color: '#10b981' },
  { name: 'Scheduled', value: 6, color: '#8b5cf6' },
  { name: 'Implementing', value: 4, color: '#06b6d4' },
  { name: 'Completed', value: 45, color: '#059669' },
  { name: 'Rejected', value: 3, color: '#ef4444' },
];

const monthlyTrendData = [
  { month: 'Jan', created: 12, completed: 8, approved: 10 },
  { month: 'Feb', created: 15, completed: 12, approved: 13 },
  { month: 'Mar', created: 18, completed: 14, approved: 16 },
  { month: 'Apr', created: 14, completed: 16, approved: 15 },
  { month: 'May', created: 20, completed: 18, approved: 19 },
  { month: 'Jun', created: 16, completed: 15, approved: 17 },
];

const changeTypeData = [
  { type: 'Emergency', count: 5 },
  { type: 'Major', count: 15 },
  { type: 'Minor', count: 35 },
  { type: 'Standard', count: 38 },
];

const riskLevelData = [
  { risk: 'Critical', count: 4 },
  { risk: 'High', count: 12 },
  { risk: 'Medium', count: 28 },
  { risk: 'Low', count: 49 },
];

const successRateData = [
  { month: 'Jan', rate: 85 },
  { month: 'Feb', rate: 88 },
  { month: 'Mar', rate: 92 },
  { month: 'Apr', rate: 90 },
  { month: 'May', rate: 94 },
  { month: 'Jun', rate: 96 },
];

const avgImplementationTimeData = [
  { month: 'Jan', days: 12 },
  { month: 'Feb', days: 11 },
  { month: 'Mar', days: 10 },
  { month: 'Apr', days: 9 },
  { month: 'May', days: 8.5 },
  { month: 'Jun', days: 8 },
];

export const MetricsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Advanced Metrics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive analytics and insights for change management
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-2 rounded-lg ${
              timeRange === '7d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            7 Days
          </button>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">96%</p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+4% from last month</span>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Implementation</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">8 days</p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span className="text-sm">-2 days from last month</span>
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Changes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">34</p>
              <div className="flex items-center mt-2 text-blue-600">
                <Activity className="w-4 h-4 mr-1" />
                <span className="text-sm">12 in review</span>
              </div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">16</p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+20% from last month</span>
              </div>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Change Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrendData}>
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
                dataKey="created"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Created"
              />
              <Line
                type="monotone"
                dataKey="approved"
                stroke="#10b981"
                strokeWidth={2}
                name="Approved"
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Type Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Changes by Type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={changeTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="type" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Level Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Changes by Risk Level
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskLevelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="risk" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate Area Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Success Rate Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={successRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Avg Implementation Time */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Avg Implementation Time (Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={avgImplementationTimeData}>
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
              <Area
                type="monotone"
                dataKey="days"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
