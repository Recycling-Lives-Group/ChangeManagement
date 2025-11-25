import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Video,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';

interface CABMeeting {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  type: 'in-person' | 'virtual' | 'hybrid';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  attendees: string[];
  agenda: AgendaItem[];
  minutes?: string;
  decisions: Decision[];
}

interface AgendaItem {
  id: string;
  changeRequestId: string;
  title: string;
  type: 'emergency' | 'major' | 'minor' | 'standard';
  duration: number; // minutes
  presenter: string;
  status: 'pending' | 'presented' | 'approved' | 'rejected' | 'deferred';
}

interface Decision {
  id: string;
  changeRequestId: string;
  decision: 'approved' | 'rejected' | 'deferred';
  votes: {
    approve: number;
    reject: number;
    abstain: number;
  };
  notes: string;
}

// Sample data
const sampleMeetings: CABMeeting[] = [
  {
    id: '1',
    title: 'Weekly CAB Review - November',
    date: new Date(2025, 10, 27, 10, 0),
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    location: 'Conference Room A',
    type: 'hybrid',
    status: 'scheduled',
    attendees: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Mike Brown'],
    agenda: [
      {
        id: 'a1',
        changeRequestId: 'CR-2025-001',
        title: 'Database Migration - Production',
        type: 'major',
        duration: 20,
        presenter: 'John Doe',
        status: 'pending',
      },
      {
        id: 'a2',
        changeRequestId: 'CR-2025-002',
        title: 'Security Patch Deployment',
        type: 'emergency',
        duration: 15,
        presenter: 'Jane Smith',
        status: 'pending',
      },
      {
        id: 'a3',
        changeRequestId: 'CR-2025-003',
        title: 'UI Component Update',
        type: 'minor',
        duration: 10,
        presenter: 'Bob Johnson',
        status: 'pending',
      },
    ],
    decisions: [],
  },
  {
    id: '2',
    title: 'Emergency CAB Session',
    date: new Date(2025, 10, 25, 15, 0),
    startTime: '3:00 PM',
    endTime: '3:30 PM',
    location: 'Virtual - Teams',
    type: 'virtual',
    status: 'completed',
    attendees: ['John Doe', 'Jane Smith', 'Alice Williams'],
    agenda: [
      {
        id: 'a4',
        changeRequestId: 'CR-2025-004',
        title: 'Critical Security Hotfix',
        type: 'emergency',
        duration: 30,
        presenter: 'Alice Williams',
        status: 'approved',
      },
    ],
    decisions: [
      {
        id: 'd1',
        changeRequestId: 'CR-2025-004',
        decision: 'approved',
        votes: { approve: 3, reject: 0, abstain: 0 },
        notes: 'Fast-tracked due to critical security vulnerability. Approved unanimously.',
      },
    ],
  },
  {
    id: '3',
    title: 'Monthly CAB Review - December',
    date: new Date(2025, 11, 4, 14, 0),
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    location: 'Conference Room B',
    type: 'in-person',
    status: 'scheduled',
    attendees: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Mike Brown', 'Sarah Davis'],
    agenda: [],
    decisions: [],
  },
];

export const CABMeetings: React.FC = () => {
  const [meetings, setMeetings] = useState<CABMeeting[]>(sampleMeetings);
  const [selectedMeeting, setSelectedMeeting] = useState<CABMeeting | null>(null);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [viewMode, setViewMode] = useState<'upcoming' | 'past'>('upcoming');

  const upcomingMeetings = meetings
    .filter((m) => m.status === 'scheduled' || m.status === 'in-progress')
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const pastMeetings = meetings
    .filter((m) => m.status === 'completed' || m.status === 'cancelled')
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const displayMeetings = viewMode === 'upcoming' ? upcomingMeetings : pastMeetings;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Clock },
      'in-progress': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: AlertCircle },
      completed: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase().replace('-', ' ')}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'in-person': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: MapPin },
      virtual: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Video },
      hybrid: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: Users },
    };

    const config = typeConfig[type as keyof typeof typeConfig];
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {type.toUpperCase().replace('-', ' ')}
      </span>
    );
  };

  const getChangeTypeBadge = (type: string) => {
    const colors = {
      emergency: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      major: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      minor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      standard: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[type as keyof typeof colors]}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  const getAgendaStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'deferred':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'presented':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            CAB Meetings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage Change Advisory Board meetings and agendas
          </p>
        </div>
        <button
          onClick={() => setShowNewMeetingModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('upcoming')}
          className={`px-4 py-2 rounded-lg ${
            viewMode === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Upcoming ({upcomingMeetings.length})
        </button>
        <button
          onClick={() => setViewMode('past')}
          className={`px-4 py-2 rounded-lg ${
            viewMode === 'past'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Past ({pastMeetings.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meetings List */}
        <div className="lg:col-span-1 space-y-4">
          {displayMeetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => setSelectedMeeting(meeting)}
              className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer transition ${
                selectedMeeting?.id === meeting.id
                  ? 'ring-2 ring-blue-600'
                  : 'hover:shadow-lg'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {meeting.title}
                </h3>
                {getStatusBadge(meeting.status)}
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(meeting.date, 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {meeting.startTime} - {meeting.endTime}
                </div>
                <div className="flex items-center gap-2">
                  {getTypeBadge(meeting.type)}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {meeting.attendees.length} attendees
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Meeting Details */}
        <div className="lg:col-span-2">
          {selectedMeeting ? (
            <div className="space-y-6">
              {/* Meeting Info Card */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedMeeting.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {format(selectedMeeting.date, 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                    <p className="text-base text-gray-900 dark:text-white font-semibold">
                      {selectedMeeting.startTime} - {selectedMeeting.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                    <p className="text-base text-gray-900 dark:text-white font-semibold">
                      {selectedMeeting.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                    <div className="mt-1">{getTypeBadge(selectedMeeting.type)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedMeeting.status)}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Attendees</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMeeting.attendees.map((attendee, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {attendee}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Agenda Card */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Agenda
                  </h3>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                {selectedMeeting.agenda.length > 0 ? (
                  <div className="space-y-3">
                    {selectedMeeting.agenda.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                #{index + 1}
                              </span>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {item.title}
                              </h4>
                              {getChangeTypeBadge(item.type)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <p>Change Request: {item.changeRequestId}</p>
                              <p>Presenter: {item.presenter}</p>
                              <p>Duration: {item.duration} minutes</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getAgendaStatusIcon(item.status)}
                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No agenda items yet</p>
                  </div>
                )}
              </div>

              {/* Decisions Card */}
              {selectedMeeting.decisions.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Decisions
                  </h3>
                  <div className="space-y-4">
                    {selectedMeeting.decisions.map((decision) => (
                      <div
                        key={decision.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {decision.changeRequestId}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              Decision: <span className="font-semibold">{decision.decision}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 mb-3 text-sm">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Approve: {decision.votes.approve}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Reject: {decision.votes.reject}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Abstain: {decision.votes.abstain}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {decision.notes}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedMeeting.status === 'scheduled' && (
                <div className="flex gap-4">
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Invitations
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    Generate Agenda
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                Select a meeting to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CABMeetings;
