import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useChangesStore } from '../store/changesStore';
import { useAuthStore } from '../store/authStore';
import { Plus, AlertCircle, CheckCircle, Clock, XCircle, FileText, TrendingUp, Activity, Award } from 'lucide-react';
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
  'On Hold': { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'On Hold' },
};

export default function Dashboard() {
  const { changes, fetchChanges, isLoading } = useChangesStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  const stats = {
    total: changes.length,
    pending: changes.filter((c) => c.status === 'New' || c.status === 'In Review').length,
    inProgress: changes.filter((c) => c.status === 'In Progress' || c.status === 'Implementing').length,
    completed: changes.filter((c) => c.status === 'Completed').length,
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
            <h2 className="text-2xl font-bold text-white">Recent Change Requests</h2>
            <p className="text-blue-100 mt-1">Track and manage your change requests</p>
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
                      <th className="pb-4 text-left font-semibold text-gray-700 dark:text-gray-300">Type</th>
                      <th className="pb-4 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="pb-4 text-left font-semibold text-gray-700 dark:text-gray-300">Risk</th>
                      <th className="pb-4 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      <th className="pb-4 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((change) => {
                      const StatusIcon = statusConfig[change.status].icon;
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
                            <Link
                              to={`/changes/${change.id}`}
                              className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {change.changeTitle}
                            </Link>
                          </td>
                          <td className="py-4">
                            <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${typeColors[change.changeType as keyof typeof typeColors]}`}>
                              {change.changeType}
                            </span>
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-3 py-1.5 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 ${
                                statusConfig[change.status].color
                              }`}
                            >
                              <StatusIcon size={14} />
                              {change.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`text-sm font-semibold ${riskColors[change.riskLevel as keyof typeof riskColors]}`}>
                              {change.riskLevel}
                            </span>
                          </td>
                          <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(change.requestDate), 'MMM d, yyyy')}
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
