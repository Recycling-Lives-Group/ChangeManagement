import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChangesStore } from '../store/changesStore';
import { ArrowLeft, Calendar, User, FileText, PoundSterling, Users, Clock, TrendingUp, Edit } from 'lucide-react';
import { format } from 'date-fns';

export default function ChangeDetailFull() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentChange, fetchChange, isLoading } = useChangesStore();

  useEffect(() => {
    if (id) {
      fetchChange(id);
    }
  }, [id, fetchChange]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading change request...</p>
        </div>
      </div>
    );
  }

  if (!currentChange) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <p className="text-gray-600 dark:text-gray-400">Change request not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const wizardData = currentChange.wizardData || {};
  const reasons = wizardData.changeReasons || {};

  // Can edit if status is not approved or implemented or completed
  const canEdit = currentChange.status !== 'approved' &&
                  currentChange.status !== 'implemented' &&
                  currentChange.status !== 'completed';

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          {canEdit && (
            <button
              onClick={() => navigate(`/changes/edit/${id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit size={18} />
              Edit Change Request
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
            <div className="flex items-center gap-2 text-blue-100 text-sm mb-2">
              <FileText size={16} />
              {currentChange.requestNumber}
            </div>
            <h1 className="text-3xl font-bold mb-2">{currentChange.title || 'Untitled Change Request'}</h1>
            {currentChange.description && (
              <p className="text-blue-100">{currentChange.description}</p>
            )}
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <User size={16} />
                  <span>Status</span>
                </div>
                <p className="text-gray-900 dark:text-white font-semibold capitalize">
                  {currentChange.status?.replace('_', ' ')}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <TrendingUp size={16} />
                  <span>Priority</span>
                </div>
                <p className="text-gray-900 dark:text-white font-semibold capitalize">
                  {currentChange.priority}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <Calendar size={16} />
                  <span>Submitted</span>
                </div>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {currentChange.submittedAt || currentChange.createdAt
                    ? format(new Date(currentChange.submittedAt || currentChange.createdAt), 'MMM d, yyyy')
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <User size={16} />
                  <span>Requester</span>
                </div>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {currentChange.requester?.name || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Business Justification */}
            {reasons && Object.values(reasons).some(v => v) && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={24} className="text-blue-600" />
                  Business Justification
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {reasons.revenueImprovement && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                      <span className="text-2xl">💰</span>
                      <span>Revenue Improvement</span>
                    </div>
                  )}
                  {reasons.costReduction && (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                      <span className="text-2xl">💵</span>
                      <span>Cost Reduction</span>
                    </div>
                  )}
                  {reasons.customerImpact && (
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium">
                      <span className="text-2xl">👥</span>
                      <span>Customer Impact</span>
                    </div>
                  )}
                  {reasons.processImprovement && (
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium">
                      <span className="text-2xl">⚙️</span>
                      <span>Process Improvement</span>
                    </div>
                  )}
                  {reasons.internalQoL && (
                    <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-medium">
                      <span className="text-2xl">😊</span>
                      <span>Internal QoL</span>
                    </div>
                  )}
                  {reasons.riskReduction && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                      <span className="text-2xl">🛡️</span>
                      <span>Risk Reduction</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Revenue Details */}
            {wizardData.revenueDetails && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-green-50 dark:bg-green-900/10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <PoundSterling size={24} className="text-green-600" />
                  Revenue Impact
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Expected Revenue
                    </label>
                    <p className="text-gray-900 dark:text-white font-bold text-2xl">
                      £{Number(wizardData.revenueDetails.expectedRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Timeline
                    </label>
                    <p className="text-gray-900 dark:text-white text-lg">
                      {wizardData.revenueDetails.revenueTimeline} months
                    </p>
                  </div>
                  {wizardData.revenueDetails.revenueDescription && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Description
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {wizardData.revenueDetails.revenueDescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cost Reduction */}
            {wizardData.costReductionDetails && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-blue-50 dark:bg-blue-900/10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <PoundSterling size={24} className="text-blue-600" />
                  Cost Reduction
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Expected Savings
                    </label>
                    <p className="text-gray-900 dark:text-white font-bold text-2xl">
                      £{Number(wizardData.costReductionDetails.expectedSavings || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Cost Areas
                    </label>
                    <p className="text-gray-900 dark:text-white text-lg">
                      {wizardData.costReductionDetails.costareas}
                    </p>
                  </div>
                  {wizardData.costReductionDetails.savingsDescription && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Description
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {wizardData.costReductionDetails.savingsDescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer Impact */}
            {wizardData.customerImpactDetails && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-purple-50 dark:bg-purple-900/10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users size={24} className="text-purple-600" />
                  Customer Impact
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Customers Affected
                    </label>
                    <p className="text-gray-900 dark:text-white font-bold text-2xl">
                      {Number(wizardData.customerImpactDetails.customersAffected || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Expected Satisfaction Increase
                    </label>
                    <p className="text-gray-900 dark:text-white text-lg">
                      {wizardData.customerImpactDetails.expectedSatisfaction}%
                    </p>
                  </div>
                  {wizardData.customerImpactDetails.impactDescription && (
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Impact Description
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {wizardData.customerImpactDetails.impactDescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Process Improvement */}
            {wizardData.processImprovementDetails && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-orange-50 dark:bg-orange-900/10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={24} className="text-orange-600" />
                  Process Improvement
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Current Issues
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {wizardData.processImprovementDetails.currentIssues}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Expected Efficiency Gain
                    </label>
                    <p className="text-gray-900 dark:text-white text-lg font-semibold">
                      {wizardData.processImprovementDetails.expectedEfficiency}
                    </p>
                  </div>
                  {wizardData.processImprovementDetails.processDescription && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Process Description
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {wizardData.processImprovementDetails.processDescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Internal QoL */}
            {wizardData.internalQoLDetails && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-pink-50 dark:bg-pink-900/10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users size={24} className="text-pink-600" />
                  Internal Quality of Life
                </h2>
                <div className="space-y-4">
                  {wizardData.internalQoLDetails.usersAffected && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Users Affected
                      </label>
                      <p className="text-gray-900 dark:text-white text-lg font-semibold">
                        {wizardData.internalQoLDetails.usersAffected}
                      </p>
                    </div>
                  )}
                  {wizardData.internalQoLDetails.currentPainPoints && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Current Pain Points
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {wizardData.internalQoLDetails.currentPainPoints}
                      </p>
                    </div>
                  )}
                  {wizardData.internalQoLDetails.expectedImprovements && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Expected Improvements
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {wizardData.internalQoLDetails.expectedImprovements}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Risk Reduction */}
            {wizardData.riskReductionDetails && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-red-50 dark:bg-red-900/10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertTriangle size={24} className="text-red-600" />
                  Risk Reduction
                </h2>
                <div className="space-y-4">
                  {wizardData.riskReductionDetails.currentRisks && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Current Risks
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {wizardData.riskReductionDetails.currentRisks}
                      </p>
                    </div>
                  )}
                  {wizardData.riskReductionDetails.riskMitigation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Risk Mitigation
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {wizardData.riskReductionDetails.riskMitigation}
                      </p>
                    </div>
                  )}
                  {wizardData.riskReductionDetails.expectedRiskReduction && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Expected Risk Reduction
                      </label>
                      <p className="text-gray-900 dark:text-white text-lg font-semibold">
                        {wizardData.riskReductionDetails.expectedRiskReduction}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Impact Assessment */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText size={24} className="text-gray-600" />
                Impact Assessment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {wizardData.proposedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Proposed Date
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {format(new Date(wizardData.proposedDate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                )}
                {wizardData.systemsAffected && wizardData.systemsAffected.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Systems Affected
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {Array.isArray(wizardData.systemsAffected)
                        ? wizardData.systemsAffected.join(', ')
                        : wizardData.systemsAffected}
                    </p>
                  </div>
                )}
                {wizardData.departments && wizardData.departments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Departments
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {Array.isArray(wizardData.departments)
                        ? wizardData.departments.join(', ')
                        : wizardData.departments}
                    </p>
                  </div>
                )}
                {wizardData.impactedUsers !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Impacted Users
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {Number(wizardData.impactedUsers).toLocaleString()}
                    </p>
                  </div>
                )}
                {wizardData.estimatedEffortHours && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Estimated Effort
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {wizardData.estimatedEffortHours} hours
                    </p>
                  </div>
                )}
                {wizardData.estimatedCost && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Estimated Cost
                    </label>
                    <p className="text-gray-900 dark:text-white font-bold text-lg">
                      £{Number(wizardData.estimatedCost).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
