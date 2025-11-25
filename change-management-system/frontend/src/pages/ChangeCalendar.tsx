import React, { useState, useCallback } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

const localizer = momentLocalizer(moment);

// Sample events - will be replaced with real API data
const sampleEvents = [
  {
    id: '1',
    title: 'Emergency Patch - Database Migration',
    start: new Date(2025, 10, 26, 10, 0),
    end: new Date(2025, 10, 26, 12, 0),
    type: 'emergency',
    status: 'scheduled',
    risk: 'high',
  },
  {
    id: '2',
    title: 'Server Upgrade - Production',
    start: new Date(2025, 10, 27, 14, 0),
    end: new Date(2025, 10, 27, 18, 0),
    type: 'major',
    status: 'approved',
    risk: 'critical',
  },
  {
    id: '3',
    title: 'Minor UI Update',
    start: new Date(2025, 10, 28, 9, 0),
    end: new Date(2025, 10, 28, 11, 0),
    type: 'minor',
    status: 'scheduled',
    risk: 'low',
  },
  {
    id: '4',
    title: 'Standard Config Change',
    start: new Date(2025, 10, 29, 13, 0),
    end: new Date(2025, 10, 29, 14, 30),
    type: 'standard',
    status: 'implementing',
    risk: 'low',
  },
  {
    id: '5',
    title: 'Network Infrastructure Update',
    start: new Date(2025, 10, 30, 20, 0),
    end: new Date(2025, 10, 30, 23, 0),
    type: 'major',
    status: 'scheduled',
    risk: 'high',
  },
  {
    id: '6',
    title: 'Security Patch Deployment',
    start: new Date(2025, 11, 1, 8, 0),
    end: new Date(2025, 11, 1, 10, 0),
    type: 'emergency',
    status: 'approved',
    risk: 'medium',
  },
  {
    id: '7',
    title: 'API Gateway Maintenance',
    start: new Date(2025, 11, 3, 15, 0),
    end: new Date(2025, 11, 3, 17, 0),
    type: 'minor',
    status: 'scheduled',
    risk: 'medium',
  },
];

interface ChangeEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'emergency' | 'major' | 'minor' | 'standard';
  status: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
}

export const ChangeCalendar: React.FC = () => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ChangeEvent | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    emergency: true,
    major: true,
    minor: true,
    standard: true,
  });

  const filteredEvents = sampleEvents.filter(
    (event) => filters[event.type as keyof typeof filters]
  );

  const eventStyleGetter = (event: any) => {
    const typeColors = {
      emergency: { backgroundColor: '#ef4444', borderColor: '#dc2626' },
      major: { backgroundColor: '#f59e0b', borderColor: '#d97706' },
      minor: { backgroundColor: '#3b82f6', borderColor: '#2563eb' },
      standard: { backgroundColor: '#10b981', borderColor: '#059669' },
    };

    const colors = typeColors[event.type as keyof typeof typeColors] || {
      backgroundColor: '#6b7280',
      borderColor: '#4b5563',
    };

    return {
      style: {
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderRadius: '4px',
        border: '2px solid',
        color: 'white',
        display: 'block',
        padding: '4px',
      },
    };
  };

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event);
  }, []);

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const toggleFilter = (type: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'implementing':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          colors[risk as keyof typeof colors]
        }`}
      >
        {risk.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Change Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visual schedule of all planned and ongoing changes
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Filter by Change Type
          </h3>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.emergency}
                onChange={() => toggleFilter('emergency')}
                className="w-4 h-4 text-red-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Emergency
              </span>
              <div className="w-4 h-4 bg-red-500 rounded"></div>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.major}
                onChange={() => toggleFilter('major')}
                className="w-4 h-4 text-orange-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Major</span>
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.minor}
                onChange={() => toggleFilter('minor')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Minor</span>
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.standard}
                onChange={() => toggleFilter('standard')}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Standard
              </span>
              <div className="w-4 h-4 bg-green-500 rounded"></div>
            </label>
          </div>
        </div>
      )}

      {/* Calendar and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div style={{ height: '600px' }}>
            <BigCalendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={handleViewChange}
              date={date}
              onNavigate={handleNavigate}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              style={{ height: '100%' }}
              views={['month', 'week', 'day', 'agenda']}
            />
          </div>
        </div>

        {/* Event Details Sidebar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {selectedEvent ? 'Change Details' : 'Upcoming Changes'}
          </h3>

          {selectedEvent ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedEvent.title}
                </h4>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedEvent.type}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Risk Level</p>
                  <div className="mt-1">{getRiskBadge(selectedEvent.risk)}</div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedEvent.status)}
                    <p className="text-base font-semibold text-gray-900 dark:text-white capitalize">
                      {selectedEvent.status}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Start Time</p>
                  <p className="text-base text-gray-900 dark:text-white">
                    {moment(selectedEvent.start).format('MMMM D, YYYY h:mm A')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">End Time</p>
                  <p className="text-base text-gray-900 dark:text-white">
                    {moment(selectedEvent.end).format('MMMM D, YYYY h:mm A')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                  <p className="text-base text-gray-900 dark:text-white">
                    {moment
                      .duration(
                        moment(selectedEvent.end).diff(moment(selectedEvent.start))
                      )
                      .asHours()
                      .toFixed(1)}{' '}
                    hours
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents
                .filter((event) => moment(event.start).isAfter(moment()))
                .sort((a, b) => moment(a.start).diff(moment(b.start)))
                .slice(0, 5)
                .map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {moment(event.start).format('MMM D, h:mm A')}
                        </p>
                      </div>
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="mt-2">{getRiskBadge(event.risk)}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangeCalendar;
