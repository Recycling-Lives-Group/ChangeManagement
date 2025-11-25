import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useChangesStore } from '../store/changesStore';
import { useAuthStore } from '../store/authStore';
import { Plus, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.name}
          </p>
        </div>
        <Link to="/changes/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          New Change Request
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</h3>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approval</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">{stats.pending}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</h3>
          <p className="text-3xl font-bold mt-2 text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{stats.completed}</p>
        </div>
      </div>

      {/* Change Requests Table */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recent Change Requests</h2>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : changes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No change requests found</p>
            <Link to="/changes/new" className="btn-primary mt-4 inline-block">
              Create your first change request
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b dark:border-gray-700">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">Title</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Risk</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {changes.map((change) => {
                  const StatusIcon = statusConfig[change.status].icon;
                  return (
                    <tr key={change.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3">
                        <Link
                          to={`/changes/${change.id}`}
                          className="font-medium hover:text-primary-600"
                        >
                          {change.changeTitle}
                        </Link>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700">
                          {change.changeType}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1 ${
                            statusConfig[change.status].color
                          }`}
                        >
                          <StatusIcon size={12} />
                          {change.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-sm">{change.riskLevel}</span>
                      </td>
                      <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(change.requestDate), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3">
                        <Link
                          to={`/changes/${change.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
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
  );
}
