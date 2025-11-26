import { useEffect, useState } from 'react';
import { useChangesStore } from '../store/changesStore';
import { useAuthStore } from '../store/authStore';
import { Users, FileText, CheckCircle, XCircle, Shield, Clock, TrendingUp, AlertTriangle, Activity, Award } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import type { ChangeStatus } from '@cm/types';

type ProjectCategory = 'All' | 'Revenue Impact' | 'Cost Reduction' | 'Customer Impact' | 'Internal QoL';

const statusConfig: Record<
  ChangeStatus,
  { color: string; icon: typeof CheckCircle; label: string }
> = {
  New: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'New' },
  'In Review': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'In Review' },
  Approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
  'In Progress': { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'In Progress' },
  Testing: { color: 'bg-purple-100 text-purple-800', icon: Clock, label: 'Testing' },
  Scheduled: { color: 'bg-indigo-100 text-indigo-800', icon: Clock, label: 'Scheduled' },
  Implementing: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Implementing' },
  Completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
  Failed: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
  Cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelled' },
  'On Hold': { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, label: 'On Hold' },
};

export default function AdminDashboard() {
  const { changes, fetchChanges, isLoading } = useChangesStore();
  const { user } = useAuthStore();
  const [selectedCategories, setSelectedCategories] = useState<ProjectCategory[]>(['All']);

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  const categories: ProjectCategory[] = ['All', 'Revenue Impact', 'Cost Reduction', 'Customer Impact', 'Internal QoL'];

  const handleCategoryToggle = (category: ProjectCategory) => {
    if (category === 'All') {
      setSelectedCategories(['All']);
    } else {
      const newCategories = selectedCategories.filter(c => c !== 'All');
      if (selectedCategories.includes(category)) {
        const filtered = newCategories.filter(c => c !== category);
        setSelectedCategories(filtered.length === 0 ? ['All'] : filtered);
      } else {
        setSelectedCategories([...newCategories, category]);
      }
    }
  };

  const stats = {
    newRequests: changes.filter((c) => c.status === 'submitted').length,
    inReview: changes.filter((c) => c.status === 'under_review').length,
    approved: changes.filter((c) => c.status === 'approved').length,
    rejected: changes.filter((c) => c.status === 'rejected').length,
  };

  // Filter changes by selected categories and exclude rejected/completed
  const activeChanges = changes.filter(change =>
    change.status !== 'rejected' &&
    change.status !== 'completed' &&
    change.status !== 'cancelled' &&
    change.status !== 'implemented'
  );

  const filteredChanges = selectedCategories.includes('All')
    ? activeChanges
    : activeChanges.filter(change => {
        const wizardData = change.wizardData || {};
        const reasons = wizardData.changeReasons || {};

        // Map reasons to categories
        if (selectedCategories.includes('Revenue Impact') && reasons.revenueImprovement) return true;
        if (selectedCategories.includes('Cost Reduction') && reasons.costReduction) return true;
        if (selectedCategories.includes('Customer Impact') && reasons.customerImpact) return true;
        if (selectedCategories.includes('Internal QoL') && reasons.internalQoL) return true;

        return false;
      });

  // Calculate benefit score using prioritization factors
  const calculateBenefitScore = (change: any) => {
    const wizardData = change.wizardData || {};

    const factors = {
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

    const weights = {
      revenueImprovement: 2.5,
      costSavings: 2.3,
      customerImpact: 2.2,
      processImprovement: 1.9,
      internalQoL: 1.6,
      strategicAlignment: 2.0,
      urgency: 1.8,
      impactScope: 1.5,
      riskLevel: 1.4,
      resourceRequirement: 1.0,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.keys(factors).forEach((key) => {
      let factorValue = factors[key as keyof typeof factors];
      if (key === 'resourceRequirement') {
        factorValue = 11 - factorValue; // Inverse
      }
      totalScore += factorValue * weights[key as keyof typeof weights];
      totalWeight += weights[key as keyof typeof weights];
    });

    return Math.round((totalScore / totalWeight) * 10); // Scale to 0-100
  };

  // Calculate effort score using risk and impact factors
  const calculateEffortScore = (change: any) => {
    // Use stored effort score if available
    if (change.effortScore !== undefined && change.effortScore !== null) {
      return change.effortScore;
    }

    const wizardData = change.wizardData || {};

    const factors = {
      impactScope: Math.min(5, Math.ceil((Number(wizardData.impactedUsers) || 10) / 50)),
      businessCritical: wizardData.urgencyLevel === 'high' ? 4 : wizardData.urgencyLevel === 'medium' ? 3 : 2,
      complexity: Math.min(5, Math.ceil((Number(wizardData.estimatedEffortHours) || 10) / 40)),
      testingCoverage: 3,
      rollbackCapability: 3,
      historicalFailures: 1,
      costToImplement: Math.min(5, Math.ceil((Number(wizardData.estimatedCost) || 1000) / 2000)),
      timeToImplement: Math.min(5, Math.ceil((Number(wizardData.estimatedEffortHours) || 10) / 40)),
    };

    const weights = {
      impactScope: 1.5,
      businessCritical: 1.8,
      complexity: 1.6,
      testingCoverage: 1.2,
      rollbackCapability: 1.4,
      historicalFailures: 1.7,
      costToImplement: 2.0,
      timeToImplement: 1.9,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.keys(factors).forEach((key) => {
      let factorValue = factors[key as keyof typeof factors];
      // Inverse scoring for positive factors
      if (key === 'testingCoverage' || key === 'rollbackCapability') {
        factorValue = 6 - factorValue;
      }
      totalScore += factorValue * weights[key as keyof typeof weights];
      totalWeight += weights[key as keyof typeof weights];
    });

    return Math.round((totalScore / totalWeight) * 20); // Scale to 0-100
  };

  // Categorize changes by benefit and effort for the matrix
  const getMatrixQuadrant = (change: any) => {
    const benefitScore = calculateBenefitScore(change);
    const effortScore = calculateEffortScore(change);

    const benefitLevel = benefitScore >= 50 ? 'high' : 'low';
    const effortLevel = effortScore >= 50 ? 'high' : 'low';

    return { benefit: benefitLevel, effort: effortLevel };
  };

  const matrixData = {
    highBenefitLowEffort: filteredChanges.filter(c => {
      const q = getMatrixQuadrant(c);
      return q.benefit === 'high' && q.effort === 'low';
    }),
    highBenefitHighEffort: filteredChanges.filter(c => {
      const q = getMatrixQuadrant(c);
      return q.benefit === 'high' && q.effort === 'high';
    }),
    lowBenefitLowEffort: filteredChanges.filter(c => {
      const q = getMatrixQuadrant(c);
      return q.benefit === 'low' && q.effort === 'low';
    }),
    lowBenefitHighEffort: filteredChanges.filter(c => {
      const q = getMatrixQuadrant(c);
      return q.benefit === 'low' && q.effort === 'high';
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              CAB Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Change Advisory Board - <span className="font-semibold text-gray-900 dark:text-white">{user?.name}</span>
          </p>
         
        </div>

        {/* Stats Cards - 4 Cards Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* New Requests Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <FileText size={28} />
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm font-medium">New Requests</p>
                <p className="text-4xl font-bold mt-1">{stats.newRequests}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <Clock size={16} />
              <span>Awaiting review</span>
            </div>
          </div>

          {/* In Review Card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Activity size={28} />
              </div>
              <div className="text-right">
                <p className="text-amber-100 text-sm font-medium">In Review</p>
                <p className="text-4xl font-bold mt-1">{stats.inReview}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-amber-100 text-sm">
              <AlertTriangle size={16} />
              <span>Under CAB review</span>
            </div>
          </div>

          {/* Approved Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <CheckCircle size={28} />
              </div>
              <div className="text-right">
                <p className="text-emerald-100 text-sm font-medium">Approved</p>
                <p className="text-4xl font-bold mt-1">{stats.approved}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-100 text-sm">
              <Award size={16} />
              <span>CAB approved</span>
            </div>
          </div>

          {/* Rejected Card */}
          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <XCircle size={28} />
              </div>
              <div className="text-right">
                <p className="text-red-100 text-sm font-medium">Rejected</p>
                <p className="text-4xl font-bold mt-1">{stats.rejected}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-red-100 text-sm">
              <XCircle size={16} />
              <span>Declined by CAB</span>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter by Project Type</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category);
              const categoryColors = {
                'All': 'from-gray-500 to-slate-600',
                'Revenue Impact': 'from-green-500 to-emerald-600',
                'Cost Reduction': 'from-blue-500 to-indigo-600',
                'Customer Impact': 'from-purple-500 to-pink-600',
                'Internal QoL': 'from-orange-500 to-amber-600',
              };

              return (
                <label
                  key={category}
                  className={`
                    flex items-center gap-3 px-6 py-3 rounded-xl cursor-pointer transition-all transform hover:scale-105
                    ${isSelected
                      ? `bg-gradient-to-r ${categoryColors[category]} text-white shadow-lg`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCategoryToggle(category)}
                    className="w-5 h-5 rounded border-2 cursor-pointer"
                  />
                  <span className="font-semibold text-sm">{category}</span>
                </label>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Showing <span className="font-semibold text-indigo-600 dark:text-indigo-400">{filteredChanges.length}</span> of {changes.length} projects
          </p>
        </div>

        {/* Benefit vs Effort Matrix (Eisenhower-style) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Benefit vs Effort Analysis</h2>
            <p className="text-indigo-100 mt-1">Prioritize change requests based on business value and implementation effort</p>
          </div>

          <div className="p-8">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-4">Loading matrix...</p>
              </div>
            ) : (
              <div className="relative">
                {/* Y-axis Label (Benefit) */}
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    BENEFIT
                  </div>
                </div>

                {/* Matrix Grid */}
                <div className="grid grid-cols-2 gap-4 ml-4">
                  {/* Top Left: High Benefit, High Effort - STRATEGIC */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6 min-h-[300px] relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300">Strategic</h3>
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                        {matrixData.highBenefitHighEffort.length}
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mb-4">High Benefit • High Effort</p>
                    <div className="flex flex-wrap gap-2">
                      {matrixData.highBenefitHighEffort.map((change, index) => (
                        <Link
                          key={change.id}
                          to={`/changes/${change.id}`}
                          className="group relative"
                          title={change.title}
                        >
                          <div className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer">
                            #{index + 1}
                          </div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {change.title}
                          </div>
                        </Link>
                      ))}
                      {matrixData.highBenefitHighEffort.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No items in this quadrant</p>
                      )}
                    </div>
                  </div>

                  {/* Top Right: High Benefit, Low Effort - MUST DO */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 min-h-[300px] relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-green-800 dark:text-green-300">Must Do</h3>
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        {matrixData.highBenefitLowEffort.length}
                      </span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-400 mb-4">High Benefit • Low Effort</p>
                    <div className="flex flex-wrap gap-2">
                      {matrixData.highBenefitLowEffort.map((change, index) => (
                        <Link
                          key={change.id}
                          to={`/changes/${change.id}`}
                          className="group relative"
                          title={change.title}
                        >
                          <div className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer">
                            #{index + 1}
                          </div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {change.title}
                          </div>
                        </Link>
                      ))}
                      {matrixData.highBenefitLowEffort.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No items in this quadrant</p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Left: Low Benefit, High Effort - RECONSIDER */}
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-6 min-h-[300px] relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-red-800 dark:text-red-300">Reconsider</h3>
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {matrixData.lowBenefitHighEffort.length}
                      </span>
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-400 mb-4">Low Benefit • High Effort</p>
                    <div className="flex flex-wrap gap-2">
                      {matrixData.lowBenefitHighEffort.map((change, index) => (
                        <Link
                          key={change.id}
                          to={`/changes/${change.id}`}
                          className="group relative"
                          title={change.title}
                        >
                          <div className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer">
                            #{index + 1}
                          </div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {change.title}
                          </div>
                        </Link>
                      ))}
                      {matrixData.lowBenefitHighEffort.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No items in this quadrant</p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Right: Low Benefit, Low Effort - QUICK FIXES */}
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-6 min-h-[300px] relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-300">Quick Fixes</h3>
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                        {matrixData.lowBenefitLowEffort.length}
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-4">Low Benefit • Low Effort</p>
                    <div className="flex flex-wrap gap-2">
                      {matrixData.lowBenefitLowEffort.map((change, index) => (
                        <Link
                          key={change.id}
                          to={`/changes/${change.id}`}
                          className="group relative"
                          title={change.title}
                        >
                          <div className="w-12 h-12 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer">
                            #{index + 1}
                          </div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {change.title}
                          </div>
                        </Link>
                      ))}
                      {matrixData.lowBenefitLowEffort.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No items in this quadrant</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* X-axis Label (Effort) */}
                <div className="flex justify-between mt-4 ml-4 px-4">
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    ← HIGH EFFORT
                  </div>
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    LOW EFFORT →
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
