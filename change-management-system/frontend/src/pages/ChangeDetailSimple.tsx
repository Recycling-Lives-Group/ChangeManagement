import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChangesStore } from '../store/changesStore';
import { ArrowLeft, Calendar, User, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function ChangeDetailSimple() {
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
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8">
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

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
            <div className="flex items-center gap-2 text-blue-100 text-sm mb-2">
              <FileText size={16} />
              {currentChange.requestNumber}
            </div>
            <h1 className="text-3xl font-bold">{currentChange.title || 'Untitled Change Request'}</h1>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium capitalize">
                    {currentChange.status?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Priority
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium capitalize">
                    {currentChange.priority}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Date Submitted
                  </label>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Calendar size={16} className="text-gray-400" />
                    {currentChange.submittedAt || currentChange.createdAt
                      ? format(new Date(currentChange.submittedAt || currentChange.createdAt), 'MMMM d, yyyy')
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Requester
                  </label>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <User size={16} className="text-gray-400" />
                    {currentChange.requester?.name || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {currentChange.description && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">
                  Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {currentChange.description}
                </p>
              </div>
            )}

            {/* Wizard Data Details */}
            {wizardData && Object.keys(wizardData).length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">
                  Additional Details
                </h2>
                <div className="space-y-4">
                  {wizardData.proposedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Proposed Date
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {format(new Date(wizardData.proposedDate), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  )}

                  {wizardData.systemsAffected && wizardData.systemsAffected.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Systems Affected
                      </label>
                      <p className="text-gray-900 dark:text-white">
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
                      <p className="text-gray-900 dark:text-white">
                        {Array.isArray(wizardData.departments)
                          ? wizardData.departments.join(', ')
                          : wizardData.departments}
                      </p>
                    </div>
                  )}

                  {wizardData.impactedUsers && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Impacted Users
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {wizardData.impactedUsers}
                      </p>
                    </div>
                  )}

                  {wizardData.estimatedEffortHours && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Estimated Effort (Hours)
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {wizardData.estimatedEffortHours}
                      </p>
                    </div>
                  )}

                  {wizardData.estimatedCost && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Estimated Cost
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        £{wizardData.estimatedCost}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Raw Data (for debugging) */}
            <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                View Raw Data (Debug)
              </summary>
              <pre className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-auto">
                {JSON.stringify(currentChange, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
