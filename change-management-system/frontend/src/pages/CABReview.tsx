import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useChangesStore } from '../store/changesStore';
import { useAuthStore } from '../store/authStore';
import { CheckCircle, XCircle, Clock, AlertTriangle, Filter, Search, Eye, ThumbsUp, ThumbsDown, FileText, PoundSterling, Users, Calendar, User, TrendingUp, DollarSign, Smile, MinusCircle, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { ChangeStatus, ChangeRequest } from '@cm/types';

const statusConfig: Record<
  string,
  { color: string; icon: typeof CheckCircle; label: string }
> = {
  draft: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Draft' },
  submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Submitted' },
  under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Under Review' },
  approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
  scheduled: { color: 'bg-indigo-100 text-indigo-800', icon: Clock, label: 'Scheduled' },
  in_progress: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'In Progress' },
  implementing: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Implementing' },
  testing: { color: 'bg-purple-100 text-purple-800', icon: Clock, label: 'Testing' },
  implemented: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Implemented' },
  completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
  failed: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
  cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelled' },
  on_hold: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, label: 'On Hold' },
};

export default function CABReview() {
  const { changes, fetchChanges, updateChange, isLoading } = useChangesStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedChange, setSelectedChange] = useState<ChangeRequest | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  // Filter changes
  const filteredChanges = changes.filter((change) => {
    const matchesSearch = (change.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || change.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDecision = async (changeId: string, decision: 'approve' | 'reject') => {
    try {
      const newStatus = decision === 'approve' ? 'approved' : 'rejected';
      await updateChange(changeId, { status: newStatus });

      toast.success(`Change request ${decision === 'approve' ? 'approved' : 'rejected'} successfully!`);

      setComment('');
      setSelectedChange(null);
      fetchChanges();
    } catch (error) {
      toast.error(`Failed to ${decision} change request`);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300',
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                CAB Review
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Review and make decisions on change requests
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('submitted')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === 'submitted'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Submitted
              </button>
              <button
                onClick={() => setFilterStatus('under_review')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === 'under_review'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Under Review
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === 'approved'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Approved
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Showing <span className="font-semibold text-indigo-600 dark:text-indigo-400">{filteredChanges.length}</span> of {changes.length} change requests
          </p>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Change Requests List */}
          <div className="lg:col-span-1 space-y-4">
            {isLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-4">Loading changes...</p>
              </div>
            ) : filteredChanges.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <Eye size={40} className="text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No changes match your filters</p>
              </div>
            ) : (
              filteredChanges.map((change) => {
                const statusInfo = statusConfig[change.status] || statusConfig['submitted'];
                const StatusIcon = statusInfo.icon;
                const wizardData = change.wizardData || {};
                const estimatedCost = wizardData.estimatedCost || 0;

                return (
                  <div
                    key={change.id}
                    onClick={() => setSelectedChange(change)}
                    className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow cursor-pointer transition-all ${
                      selectedChange?.id === change.id
                        ? 'ring-2 ring-indigo-600 shadow-lg'
                        : 'hover:shadow-xl'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 ${statusInfo.color}`}>
                            <StatusIcon size={12} />
                            {statusInfo.label}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                          {change.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {change.requestNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getPriorityColor(change.priority)}`}>
                        {change.priority}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>Submitted:</span>
                        <span className="font-semibold">
                          {change.submittedAt ? format(new Date(change.submittedAt), 'MMM d') : 'N/A'}
                        </span>
                      </div>
                      {estimatedCost > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Cost:</span>
                          <span className="font-semibold">£{Number(estimatedCost).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Change Request Details */}
          <div className="lg:col-span-2">
            {selectedChange ? (
              <div className="space-y-6">
                {/* Details Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedChange.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {selectedChange.description || selectedChange.wizardData?.briefDescription || 'No description provided'}
                      </p>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getPriorityColor(selectedChange.priority)}`}>
                          PRIORITY: {selectedChange.priority}
                        </span>
                      </div>
                    </div>
                    {(() => {
                      const statusInfo = statusConfig[selectedChange.status] || statusConfig['submitted'];
                      const StatusIcon = statusInfo.icon;
                      return (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label.toUpperCase()}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Request Number</p>
                      <p className="text-base text-gray-900 dark:text-white font-semibold">
                        {selectedChange.requestNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Requester</p>
                      <p className="text-base text-gray-900 dark:text-white font-semibold">
                        {selectedChange.requester?.name || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Submitted</p>
                      <p className="text-base text-gray-900 dark:text-white font-semibold">
                        {selectedChange.submittedAt ? format(new Date(selectedChange.submittedAt), 'MMM d, yyyy') : 'N/A'}
                      </p>
                    </div>
                    {selectedChange.wizardData?.proposedDate && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Proposed Date</p>
                        <p className="text-base text-gray-900 dark:text-white font-semibold">
                          {format(new Date(selectedChange.wizardData.proposedDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Statistics Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                    Review Statistics
                  </h3>
                  {(() => {
                    // Calculate actual stats based on change status
                    // In the future, this will come from a proper voting/approval table
                    const approve = selectedChange.status === 'approved' ? 1 : 0;
                    const reject = selectedChange.status === 'rejected' ? 1 : 0;
                    const votesReceived = approve + reject;
                    const pending = votesReceived === 0 ? 1 : 0;

                    // Dynamic CAB size - will fetch from API in future
                    // For now, assume minimum 3 CAB members
                    const totalCABMembers = 3;
                    const quorumRequired = Math.ceil(totalCABMembers / 2); // Majority quorum
                    const approvalThreshold = 50; // 50% of votes cast need to be approve

                    // Calculate metrics
                    const quorumMet = votesReceived >= quorumRequired;
                    const approvalRate = votesReceived > 0 ? (approve / votesReceived) * 100 : 0;
                    const approvalMet = approvalRate >= approvalThreshold;

                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <ThumbsUp className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {approve}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Approve</p>
                          </div>
                          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <ThumbsDown className="w-8 h-8 mx-auto mb-2 text-red-600 dark:text-red-400" />
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {reject}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Reject</p>
                          </div>
                          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <MinusCircle className="w-8 h-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {pending}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Votes Received</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {votesReceived} / {totalCABMembers}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${votesReceived >= totalCABMembers ? 'bg-green-600' : 'bg-blue-600'}`}
                              style={{ width: `${Math.min((votesReceived / totalCABMembers) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {votesReceived > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Approval Rate</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {approvalRate.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${approvalMet ? 'bg-green-600' : 'bg-red-600'}`}
                                style={{ width: `${Math.min(approvalRate, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {quorumMet && approvalMet && (
                          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <p className="text-sm text-green-800 dark:text-green-200 font-semibold">
                              Majority reached - Change approved
                            </p>
                          </div>
                        )}

                        {votesReceived === 0 && (
                          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold">
                              Awaiting CAB review - {quorumRequired} votes needed for quorum
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Benefit Summary Card */}
                {selectedChange.wizardData && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      Benefit Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedChange.wizardData.revenueDetails?.expectedRevenue && (
                        <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-green-200 dark:border-green-700">
                          <PoundSterling className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            £{Number(selectedChange.wizardData.revenueDetails.expectedRevenue).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Expected Revenue</p>
                          {selectedChange.wizardData.revenueDetails.revenueTimeline && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              in {selectedChange.wizardData.revenueDetails.revenueTimeline} months
                            </p>
                          )}
                        </div>
                      )}
                      {selectedChange.wizardData.costReductionDetails?.expectedSavings && (
                        <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-green-200 dark:border-green-700">
                          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            £{Number(selectedChange.wizardData.costReductionDetails.expectedSavings).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Expected Savings</p>
                          {selectedChange.wizardData.costReductionDetails.costareas && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {selectedChange.wizardData.costReductionDetails.costareas}
                            </p>
                          )}
                        </div>
                      )}
                      {selectedChange.wizardData.customerImpactDetails?.expectedSatisfaction && (
                        <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-green-200 dark:border-green-700">
                          <Smile className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            +{selectedChange.wizardData.customerImpactDetails.expectedSatisfaction}%
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction</p>
                          {selectedChange.wizardData.customerImpactDetails.customersAffected && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {Number(selectedChange.wizardData.customerImpactDetails.customersAffected).toLocaleString()} customers
                            </p>
                          )}
                        </div>
                      )}
                      {selectedChange.wizardData.processImprovementDetails?.expectedEfficiency && (
                        <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-green-200 dark:border-green-700">
                          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedChange.wizardData.processImprovementDetails.expectedEfficiency}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency Gain</p>
                        </div>
                      )}
                    </div>

                    {/* Business Justification Reasons */}
                    {selectedChange.wizardData.changeReasons && Object.values(selectedChange.wizardData.changeReasons).some(v => v) && (
                      <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Business Justification:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedChange.wizardData.changeReasons.revenueImprovement && (
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                              💰 Revenue Improvement
                            </span>
                          )}
                          {selectedChange.wizardData.changeReasons.costReduction && (
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                              💵 Cost Reduction
                            </span>
                          )}
                          {selectedChange.wizardData.changeReasons.customerImpact && (
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-full text-xs font-medium">
                              👥 Customer Impact
                            </span>
                          )}
                          {selectedChange.wizardData.changeReasons.processImprovement && (
                            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 rounded-full text-xs font-medium">
                              ⚙️ Process Improvement
                            </span>
                          )}
                          {selectedChange.wizardData.changeReasons.internalQoL && (
                            <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300 rounded-full text-xs font-medium">
                              😊 Internal QoL
                            </span>
                          )}
                          {selectedChange.wizardData.changeReasons.riskReduction && (
                            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 rounded-full text-xs font-medium">
                              🛡️ Risk Reduction
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Impact Summary Card */}
                {selectedChange.wizardData && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Implementation Impact
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedChange.wizardData.estimatedCost && (
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <PoundSterling className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            £{Number(selectedChange.wizardData.estimatedCost).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Cost</p>
                        </div>
                      )}
                      {selectedChange.wizardData.impactedUsers && (
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <Users className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {Number(selectedChange.wizardData.impactedUsers).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Users Impacted</p>
                        </div>
                      )}
                      {selectedChange.wizardData.estimatedEffortHours && (
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedChange.wizardData.estimatedEffortHours}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Hours Effort</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cast Decision Card */}
                {(selectedChange.status === 'submitted' || selectedChange.status === 'under_review') && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Make Decision
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Comment (Optional)
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add your comments or reasoning..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleDecision(selectedChange.id, 'approve')}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
                        >
                          <ThumbsUp className="w-5 h-5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecision(selectedChange.id, 'reject')}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
                        >
                          <ThumbsDown className="w-5 h-5" />
                          Reject
                        </button>
                      </div>
                      <Link
                        to={`/changes/${selectedChange.id}`}
                        className="block w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-semibold"
                      >
                        <Eye size={16} className="inline mr-2" />
                        View Full Details
                      </Link>
                    </div>
                  </div>
                )}

                {/* Already Decided */}
                {selectedChange.status === 'approved' || selectedChange.status === 'rejected' && (
                  <div className={`p-6 rounded-2xl ${
                    selectedChange.status === 'approved'
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      {selectedChange.status === 'approved' ? (
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <p className={`text-lg font-semibold ${
                          selectedChange.status === 'approved'
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-red-800 dark:text-red-200'
                        }`}>
                          This change request has been {selectedChange.status}
                        </p>
                        <Link
                          to={`/changes/${selectedChange.id}`}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View full details →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-xl text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Select a change request to view details and make a decision
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
