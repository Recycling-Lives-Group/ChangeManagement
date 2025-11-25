import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useChangesStore } from '../store/changesStore';
import { useAuthStore } from '../store/authStore';
import { CheckCircle, XCircle, Clock, AlertTriangle, Filter, Search, Eye } from 'lucide-react';
import { format } from 'date-fns';
import type { ChangeStatus } from '@cm/types';

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

export default function CABReview() {
  const { changes, fetchChanges, isLoading } = useChangesStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  // Filter changes
  const filteredChanges = changes.filter((change) => {
    const matchesSearch = change.changeTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || change.status === filterStatus;
    const matchesRisk = filterRisk === 'all' || change.riskLevel === filterRisk;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Mock decision handler - will be connected to backend later
  const handleDecision = (changeId: string, decision: 'approve' | 'reject') => {
    console.log(`Decision for ${changeId}: ${decision}`);
    // TODO: Connect to backend API
    alert(`Change ${decision === 'approve' ? 'approved' : 'rejected'}! (This will be connected to backend later)`);
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

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Search Changes
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Filter size={16} className="inline mr-1" />
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="all">All Status</option>
                <option value="New">New</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Cancelled">Rejected</option>
              </select>
            </div>

            {/* Risk Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Filter size={16} className="inline mr-1" />
                Risk Level
              </label>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="all">All Risk Levels</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-indigo-600 dark:text-indigo-400">{filteredChanges.length}</span> of {changes.length} change requests
          </div>
        </div>

        {/* Change Requests List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Loading changes...</p>
            </div>
          ) : filteredChanges.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye size={40} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">No changes match your filters</p>
            </div>
          ) : (
            filteredChanges.map((change) => {
              const StatusIcon = statusConfig[change.status].icon;
              const riskColors = {
                Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300',
                High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-300',
                Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300',
                Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300'
              };
              const typeColors = {
                Emergency: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                Major: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
                Minor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                Standard: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              };

              return (
                <div
                  key={change.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Left side - Change info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Risk indicator */}
                          <div className={`px-3 py-1 rounded-lg border-2 text-xs font-bold ${riskColors[change.riskLevel as keyof typeof riskColors]}`}>
                            {change.riskLevel}
                          </div>

                          <div className="flex-1">
                            <Link
                              to={`/changes/${change.id}`}
                              className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                              {change.changeTitle}
                            </Link>

                            <div className="flex items-center gap-3 mt-2">
                              <span className={`px-3 py-1 text-xs font-bold rounded-full ${typeColors[change.changeType as keyof typeof typeColors]}`}>
                                {change.changeType}
                              </span>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 ${statusConfig[change.status].color}`}>
                                <StatusIcon size={12} />
                                {change.status}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {format(new Date(change.requestDate), 'MMM d, yyyy')}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                              {change.businessJustification}
                            </p>

                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                              <div>
                                <span className="font-semibold">Requester:</span> {change.requestedBy?.name || 'Unknown'}
                              </div>
                              <div>
                                <span className="font-semibold">Impact:</span> {change.impactedUsers} users
                              </div>
                              <div>
                                <span className="font-semibold">Cost:</span> £{change.financialImpact?.toLocaleString() || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Actions */}
                      <div className="flex lg:flex-col gap-3 lg:min-w-[200px]">
                        <Link
                          to={`/changes/${change.id}`}
                          className="flex-1 lg:w-full px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                        >
                          <Eye size={16} className="inline mr-2" />
                          View Details
                        </Link>

                        {(change.status === 'New' || change.status === 'In Review') && (
                          <>
                            <button
                              onClick={() => handleDecision(change.id, 'approve')}
                              className="flex-1 lg:w-full px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                            >
                              <CheckCircle size={16} className="inline mr-2" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleDecision(change.id, 'reject')}
                              className="flex-1 lg:w-full px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold hover:from-red-600 hover:to-rose-700 transition-all shadow-md hover:shadow-lg"
                            >
                              <XCircle size={16} className="inline mr-2" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
