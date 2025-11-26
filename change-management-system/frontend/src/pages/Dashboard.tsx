import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useChangesStore } from '../store/changesStore';
import { useAuthStore } from '../store/authStore';
import { Plus, AlertCircle, CheckCircle, Clock, XCircle, FileText, TrendingUp, Activity, Award } from 'lucide-react';
import { format } from 'date-fns';
import type { ChangeStatus } from '@cm/types';

const statusConfig: Record<
  string,
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
  'On Hold': { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'On Hold' },
  // MariaDB status values
  draft: { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Draft' },
  submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Submitted' },
  under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Under Review' },
  approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
  scheduled: { color: 'bg-indigo-100 text-indigo-800', icon: Clock, label: 'Scheduled' },
  in_progress: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'In Progress' },
  completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelled' },
};

export default function Dashboard() {
  const { changes, fetchChanges, isLoading } = useChangesStore();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  const filteredChanges = changes.filter((change) => {
    if (statusFilter === 'all') return true;
    return change.status === statusFilter;
  });

  const stats = {
    total: changes.length,
    pending: changes.filter((c) => c.status === 'submitted' || c.status === 'under_review').length,
    inProgress: changes.filter((c) => c.status === 'in_progress' || c.status === 'implementing' || c.status === 'scheduled').length,
    completed: changes.filter((c) => c.status === 'completed' || c.status === 'implemented').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              User Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Welcome back, <span className="font-semibold text-gray-900 dark:text-white">{user?.name}</span>
            </p>
          </div>
          <Link
            to="/changes/new"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            New Change Request
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Requests Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <FileText size={24} />
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm font-medium">Total Requests</p>
                <p className="text-4xl font-bold mt-1">{stats.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <TrendingUp size={16} />
              <span>All change requests</span>
            </div>
          </div>

          {/* Pending Approval Card */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Clock size={24} />
              </div>
              <div className="text-right">
                <p className="text-yellow-100 text-sm font-medium">Pending Approval</p>
                <p className="text-4xl font-bold mt-1">{stats.pending}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-yellow-100 text-sm">
              <AlertCircle size={16} />
              <span>Awaiting review</span>
            </div>
          </div>

          {/* In Progress Card */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Activity size={24} />
              </div>
              <div className="text-right">
                <p className="text-purple-100 text-sm font-medium">In Progress</p>
                <p className="text-4xl font-bold mt-1">{stats.inProgress}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-purple-100 text-sm">
              <TrendingUp size={16} />
              <span>Currently active</span>
            </div>
          </div>

          {/* Completed Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Award size={24} />
              </div>
              <div className="text-right">
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <p className="text-4xl font-bold mt-1">{stats.completed}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-100 text-sm">
              <CheckCircle size={16} />
              <span>Successfully finished</span>
            </div>
          </div>
        </div>

        {/* Change Requests Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Change Requests</h2>
                <p className="text-blue-100 mt-1">Track and manage your change requests</p>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white focus:ring-2 focus:ring-white/50 focus:outline-none"
                >
                  <option value="all" className="text-gray-900">All Statuses</option>
                  <option value="draft" className="text-gray-900">Draft</option>
                  <option value="submitted" className="text-gray-900">Submitted</option>
                  <option value="under_review" className="text-gray-900">Under Review</option>
                  <option value="approved" className="text-gray-900">Approved</option>
                  <option value="rejected" className="text-gray-900">Rejected</option>
                  <option value="scheduled" className="text-gray-900">Scheduled</option>
                  <option value="in_progress" className="text-gray-900">In Progress</option>
                  <option value="completed" className="text-gray-900">Completed</option>
                  <option value="cancelled" className="text-gray-900">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-4">Loading changes...</p>
              </div>
            ) : changes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={40} className="text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No change requests found</p>
                <Link
                  to="/changes/new"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  <Plus size={20} />
                  Create your first change request
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className="pb-4 text-left font-semibold text-gray-700 dark:text-gray-300">Title</th>
                      <th className="pb-4 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="pb-4 text-left font-semibold text-gray-700 dark:text-gray-300">Date Submitted</th>
                      <th className="pb-4 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChanges.map((change) => {
                      const statusInfo = statusConfig[change.status] || statusConfig['submitted'];
                      const StatusIcon = statusInfo.icon;
                      const riskColors = {
                        Critical: 'text-red-600 dark:text-red-400 font-bold',
                        High: 'text-orange-600 dark:text-orange-400 font-semibold',
                        Medium: 'text-yellow-600 dark:text-yellow-400',
                        Low: 'text-green-600 dark:text-green-400'
                      };
                      const typeColors = {
                        Emergency: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                        Major: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
                        Minor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                        Standard: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      };

                      return (
                        <tr
                          key={change.id}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-colors"
                        >
                          <td className="py-4">
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {change.title || 'Untitled'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {change.requestNumber}
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-3 py-1.5 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 ${
                                statusInfo.color
                              }`}
                            >
                              <StatusIcon size={14} />
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                            {change.submittedAt || change.createdAt ? format(new Date(change.submittedAt || change.createdAt), 'MMM d, yyyy') : 'N/A'}
                          </td>
                          <td className="py-4">
                            <Link
                              to={`/changes/${change.id}`}
                              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
