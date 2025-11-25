import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  FileText,
  Send,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';

interface VotingItem {
  id: string;
  changeRequestId: string;
  title: string;
  description: string;
  type: 'emergency' | 'major' | 'minor' | 'standard';
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  requester: string;
  submittedDate: Date;
  votingDeadline: Date;
  status: 'open' | 'closed' | 'approved' | 'rejected';
  votes: Vote[];
  myVote?: 'approve' | 'reject' | 'abstain';
  quorumRequired: number;
  approvalThreshold: number; // percentage
}

interface Vote {
  id: string;
  voter: string;
  vote: 'approve' | 'reject' | 'abstain';
  timestamp: Date;
  comment?: string;
}

// Sample data
const sampleVotingItems: VotingItem[] = [
  {
    id: '1',
    changeRequestId: 'CR-2025-001',
    title: 'Production Database Migration to PostgreSQL 16',
    description: 'Migrate the main production database from PostgreSQL 14 to version 16 to leverage performance improvements and new features. This change includes a 2-hour maintenance window during off-peak hours.',
    type: 'major',
    riskLevel: 'high',
    requester: 'John Doe',
    submittedDate: new Date(2025, 10, 20),
    votingDeadline: new Date(2025, 10, 28),
    status: 'open',
    votes: [
      {
        id: 'v1',
        voter: 'Jane Smith',
        vote: 'approve',
        timestamp: new Date(2025, 10, 21),
        comment: 'Good plan, comprehensive rollback strategy in place.',
      },
      {
        id: 'v2',
        voter: 'Bob Johnson',
        vote: 'approve',
        timestamp: new Date(2025, 10, 22),
      },
    ],
    quorumRequired: 5,
    approvalThreshold: 75,
  },
  {
    id: '2',
    changeRequestId: 'CR-2025-002',
    title: 'Emergency Security Patch - CVE-2025-1234',
    description: 'Critical security patch to address a zero-day vulnerability in the authentication service. This requires immediate deployment to prevent potential security breaches.',
    type: 'emergency',
    riskLevel: 'critical',
    requester: 'Alice Williams',
    submittedDate: new Date(2025, 10, 24),
    votingDeadline: new Date(2025, 10, 26),
    status: 'open',
    votes: [
      {
        id: 'v3',
        voter: 'John Doe',
        vote: 'approve',
        timestamp: new Date(2025, 10, 24),
        comment: 'Critical security fix, must be deployed immediately.',
      },
      {
        id: 'v4',
        voter: 'Jane Smith',
        vote: 'approve',
        timestamp: new Date(2025, 10, 24),
      },
      {
        id: 'v5',
        voter: 'Bob Johnson',
        vote: 'approve',
        timestamp: new Date(2025, 10, 24),
      },
      {
        id: 'v6',
        voter: 'Mike Brown',
        vote: 'approve',
        timestamp: new Date(2025, 10, 25),
      },
    ],
    myVote: 'approve',
    quorumRequired: 3,
    approvalThreshold: 66,
  },
  {
    id: '3',
    changeRequestId: 'CR-2025-003',
    title: 'Update API Rate Limiting Configuration',
    description: 'Adjust API rate limiting thresholds to accommodate increased traffic from mobile app users.',
    type: 'minor',
    riskLevel: 'low',
    requester: 'Sarah Davis',
    submittedDate: new Date(2025, 10, 18),
    votingDeadline: new Date(2025, 10, 25),
    status: 'approved',
    votes: [
      {
        id: 'v7',
        voter: 'John Doe',
        vote: 'approve',
        timestamp: new Date(2025, 10, 19),
      },
      {
        id: 'v8',
        voter: 'Jane Smith',
        vote: 'approve',
        timestamp: new Date(2025, 10, 19),
      },
      {
        id: 'v9',
        voter: 'Bob Johnson',
        vote: 'approve',
        timestamp: new Date(2025, 10, 20),
      },
      {
        id: 'v10',
        voter: 'Alice Williams',
        vote: 'approve',
        timestamp: new Date(2025, 10, 20),
      },
      {
        id: 'v11',
        voter: 'Mike Brown',
        vote: 'abstain',
        timestamp: new Date(2025, 10, 21),
        comment: 'Not my area of expertise.',
      },
    ],
    myVote: 'approve',
    quorumRequired: 5,
    approvalThreshold: 75,
  },
];

export const VotingSystem: React.FC = () => {
  const [items, setItems] = useState<VotingItem[]>(sampleVotingItems);
  const [selectedItem, setSelectedItem] = useState<VotingItem | null>(null);
  const [voteComment, setVoteComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');

  const filteredItems = items.filter((item) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'open') return item.status === 'open';
    if (filterStatus === 'closed') return item.status === 'approved' || item.status === 'rejected' || item.status === 'closed';
    return true;
  });

  const handleVote = (itemId: string, vote: 'approve' | 'reject' | 'abstain') => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newVote: Vote = {
            id: `v${Date.now()}`,
            voter: 'Current User', // Would be actual user in production
            vote,
            timestamp: new Date(),
            comment: voteComment || undefined,
          };
          return {
            ...item,
            myVote: vote,
            votes: [...item.votes, newVote],
          };
        }
        return item;
      })
    );
    setVoteComment('');
    if (selectedItem?.id === itemId) {
      setSelectedItem(items.find((item) => item.id === itemId) || null);
    }
  };

  const calculateVoteStats = (item: VotingItem) => {
    const total = item.votes.length;
    const approve = item.votes.filter((v) => v.vote === 'approve').length;
    const reject = item.votes.filter((v) => v.vote === 'reject').length;
    const abstain = item.votes.filter((v) => v.vote === 'abstain').length;
    const approvalRate = total > 0 ? (approve / total) * 100 : 0;
    const quorumMet = total >= item.quorumRequired;
    const approvalMet = approvalRate >= item.approvalThreshold;

    return { total, approve, reject, abstain, approvalRate, quorumMet, approvalMet };
  };

  const getTypeColor = (type: string) => {
    const colors = {
      emergency: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      major: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      minor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      standard: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return colors[type as keyof typeof colors];
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return colors[risk as keyof typeof colors];
  };

  const getStatusBadge = (status: string) => {
    const config = {
      open: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Clock },
      closed: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: MinusCircle },
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
    };

    const { color, icon: Icon } = config[status as keyof typeof config];

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${color}`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            CAB Voting System
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and vote on change requests
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus('open')}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === 'open'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Open
        </button>
        <button
          onClick={() => setFilterStatus('closed')}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === 'closed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Closed
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voting Items List */}
        <div className="lg:col-span-1 space-y-4">
          {filteredItems.map((item) => {
            const stats = calculateVoteStats(item);
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer transition ${
                  selectedItem?.id === item.id
                    ? 'ring-2 ring-blue-600'
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(item.status)}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {item.changeRequestId}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(item.type)}`}>
                    {item.type.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(item.riskLevel)}`}>
                    {item.riskLevel.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Votes:</span>
                    <span className="font-semibold">
                      {stats.total} / {item.quorumRequired} (Quorum)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Approval:</span>
                    <span className={`font-semibold ${stats.approvalMet ? 'text-green-600' : 'text-orange-600'}`}>
                      {stats.approvalRate.toFixed(0)}% / {item.approvalThreshold}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Deadline:</span>
                    <span>{format(item.votingDeadline, 'MMM d')}</span>
                  </div>
                </div>

                {item.myVote && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Your vote:{' '}
                      <span className="font-semibold capitalize">{item.myVote}</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Voting Details */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="space-y-6">
              {/* Item Details Card */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedItem.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {selectedItem.description}
                    </p>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(selectedItem.type)}`}>
                        {selectedItem.type.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(selectedItem.riskLevel)}`}>
                        RISK: {selectedItem.riskLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(selectedItem.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Change Request ID</p>
                    <p className="text-base text-gray-900 dark:text-white font-semibold">
                      {selectedItem.changeRequestId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Requester</p>
                    <p className="text-base text-gray-900 dark:text-white font-semibold">
                      {selectedItem.requester}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Submitted</p>
                    <p className="text-base text-gray-900 dark:text-white font-semibold">
                      {format(selectedItem.submittedDate, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Voting Deadline</p>
                    <p className="text-base text-gray-900 dark:text-white font-semibold">
                      {format(selectedItem.votingDeadline, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Voting Stats Card */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Voting Statistics
                </h3>
                {(() => {
                  const stats = calculateVoteStats(selectedItem);
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                          <ThumbsUp className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stats.approve}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Approve</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                          <ThumbsDown className="w-8 h-8 mx-auto mb-2 text-red-600 dark:text-red-400" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stats.reject}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Reject</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <MinusCircle className="w-8 h-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stats.abstain}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Abstain</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Quorum Progress</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {stats.total} / {selectedItem.quorumRequired}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${stats.quorumMet ? 'bg-green-600' : 'bg-blue-600'}`}
                            style={{ width: `${Math.min((stats.total / selectedItem.quorumRequired) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Approval Rate</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {stats.approvalRate.toFixed(1)}% / {selectedItem.approvalThreshold}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${stats.approvalMet ? 'bg-green-600' : 'bg-orange-600'}`}
                            style={{ width: `${Math.min(stats.approvalRate, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {stats.quorumMet && stats.approvalMet && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <p className="text-sm text-green-800 dark:text-green-200 font-semibold">
                            Quorum met and approval threshold reached
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Cast Vote Card */}
              {selectedItem.status === 'open' && !selectedItem.myVote && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Cast Your Vote
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Comment (Optional)
                      </label>
                      <textarea
                        value={voteComment}
                        onChange={(e) => setVoteComment(e.target.value)}
                        placeholder="Add your comments or reasoning..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVote(selectedItem.id, 'approve')}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold"
                      >
                        <ThumbsUp className="w-5 h-5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleVote(selectedItem.id, 'reject')}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 font-semibold"
                      >
                        <ThumbsDown className="w-5 h-5" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleVote(selectedItem.id, 'abstain')}
                        className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2 font-semibold"
                      >
                        <MinusCircle className="w-5 h-5" />
                        Abstain
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Vote History Card */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Vote History
                </h3>
                <div className="space-y-3">
                  {selectedItem.votes.length > 0 ? (
                    selectedItem.votes
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .map((vote) => (
                        <div
                          key={vote.id}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              {vote.vote === 'approve' && (
                                <ThumbsUp className="w-4 h-4 text-green-600" />
                              )}
                              {vote.vote === 'reject' && (
                                <ThumbsDown className="w-4 h-4 text-red-600" />
                              )}
                              {vote.vote === 'abstain' && (
                                <MinusCircle className="w-4 h-4 text-gray-600" />
                              )}
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {vote.voter}
                              </span>
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {format(vote.timestamp, 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize mb-1">
                            {vote.vote}
                          </p>
                          {vote.comment && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {vote.comment}
                            </p>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No votes yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                Select a change request to view details and vote
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingSystem;
