import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChangesStore } from '../store/changesStore';
import { ArrowLeft } from 'lucide-react';

export default function ChangeDetail() {
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
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  if (!currentChange) {
    return (
      <div className="card">
        <p>Change request not found</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="card">
        <h1 className="text-3xl font-bold mb-6">{currentChange.changeTitle}</h1>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Type:</h3>
            <p>{currentChange.changeType}</p>
          </div>
          <div>
            <h3 className="font-semibold">Status:</h3>
            <p>{currentChange.status}</p>
          </div>
          <div>
            <h3 className="font-semibold">Business Justification:</h3>
            <p>{currentChange.businessJustification}</p>
          </div>
          {/* Add more details as needed */}
        </div>
      </div>
    </div>
  );
}
