import { useEffect } from 'react';
import { useChangesStore } from '../store/changesStore';
import { Users, FileText, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { changes, fetchChanges, isLoading } = useChangesStore();

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  const stats = {
    totalChanges: changes.length,
    pendingApproval: changes.filter((c) => c.status === 'In Review').length,
    approved: changes.filter((c) => c.status === 'Approved').length,
    rejected: changes.filter((c) => c.status === 'Cancelled').length,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <FileText className="text-primary-600" size={32} />
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Changes</h3>
              <p className="text-2xl font-bold">{stats.totalChanges}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <Users className="text-yellow-600" size={32} />
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approval</h3>
              <p className="text-2xl font-bold">{stats.pendingApproval}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" size={32} />
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</h3>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <XCircle className="text-red-600" size={32} />
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</h3>
              <p className="text-2xl font-bold">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">All Change Requests</h2>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            Displaying {changes.length} change requests. Full admin features coming soon...
          </p>
        )}
      </div>
    </div>
  );
}
