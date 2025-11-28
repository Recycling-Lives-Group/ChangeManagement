import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Banknote, TrendingDown, Clock, FileText, XCircle, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MetricsData {
  benefitTypes: Array<{ benefit_type: string; count: number }>;
  revenue: { total: number };
  costSavings: { total: number };
  hoursSaved: { total: number };
  statusCounts: {
    submitted: number;
    rejected: number;
    scheduled: number;
    completed: number;
  };
}

const benefitTypeLabels: Record<string, string> = {
  revenueImprovement: 'Revenue Improvement',
  costReduction: 'Cost Reduction',
  customerImpact: 'Customer Impact',
  processImprovement: 'Process Improvement',
  internalQoL: 'Internal QoL',
  riskReduction: 'Risk Reduction',
};

const benefitTypeColors: Record<string, string> = {
  revenueImprovement: '#10b981',
  costReduction: '#3b82f6',
  customerImpact: '#8b5cf6',
  processImprovement: '#f59e0b',
  internalQoL: '#ec4899',
  riskReduction: '#ef4444',
};

export const MetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setMetrics(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      toast.error('Failed to load metrics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Failed to load metrics</div>
      </div>
    );
  }

  // Prepare chart data
  const benefitTypeChartData = metrics.benefitTypes.map((item) => ({
    name: benefitTypeLabels[item.benefit_type] || item.benefit_type,
    count: item.count,
    color: benefitTypeColors[item.benefit_type] || '#6b7280',
  }));

  const financialData = [
    { name: 'Revenue Improvement', value: metrics.revenue.total, color: '#10b981' },
    { name: 'Cost Reduction', value: metrics.costSavings.total, color: '#3b82f6' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Metrics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Key performance indicators and analytics
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* New Changes Submitted */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <FileText size={24} />
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm font-medium">New Submissions</p>
              <p className="text-4xl font-bold mt-1">{metrics.statusCounts.submitted}</p>
            </div>
          </div>
          <div className="text-blue-100 text-sm">
            Changes submitted for review
          </div>
        </div>

        {/* Rejected Changes */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <XCircle size={24} />
            </div>
            <div className="text-right">
              <p className="text-red-100 text-sm font-medium">Rejected</p>
              <p className="text-4xl font-bold mt-1">{metrics.statusCounts.rejected}</p>
            </div>
          </div>
          <div className="text-red-100 text-sm">
            Changes not approved
          </div>
        </div>

        {/* Scheduled Changes */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <CalendarIcon size={24} />
            </div>
            <div className="text-right">
              <p className="text-indigo-100 text-sm font-medium">Scheduled</p>
              <p className="text-4xl font-bold mt-1">{metrics.statusCounts.scheduled}</p>
            </div>
          </div>
          <div className="text-indigo-100 text-sm">
            Ready for implementation
          </div>
        </div>

        {/* Completed Changes */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <CheckCircle size={24} />
            </div>
            <div className="text-right">
              <p className="text-green-100 text-sm font-medium">Completed</p>
              <p className="text-4xl font-bold mt-1">{metrics.statusCounts.completed}</p>
            </div>
          </div>
          <div className="text-green-100 text-sm">
            Successfully finished
          </div>
        </div>
      </div>

      {/* Charts Row 1 - Benefit Types and Financial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Changes by Benefit Type */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Changes by Benefit Type
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={benefitTypeChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, count }) => `${name}: ${count}`}
                labelStyle={{ fill: '#374151', fontSize: '12px', fontWeight: '500' }}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
              >
                {benefitTypeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                }}
                itemStyle={{
                  color: '#ffffff',
                }}
                labelStyle={{
                  color: '#ffffff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Improvement & Cost Reduction */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Revenue & Cost Savings
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                }}
                itemStyle={{
                  color: '#ffffff',
                }}
                labelStyle={{
                  color: '#ffffff',
                }}
                formatter={(value: number) => `£${value.toLocaleString()}`}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {financialData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 - Hours Saved */}
      <div className="grid grid-cols-1 gap-6">
        {/* Hours Saved Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Process Efficiency
          </h3>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Clock size={48} className="text-yellow-500" />
              </div>
              <p className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {metrics.hoursSaved.total.toLocaleString()}
              </p>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Hours Saved Through Process Improvements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
