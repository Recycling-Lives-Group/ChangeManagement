import React, { useState, useCallback, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, Clock, AlertCircle, CheckCircle2, XCircle, Edit, Save, X } from 'lucide-react';
import { useChangesStore } from '../store/changesStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const localizer = momentLocalizer(moment);

interface ChangeEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  requestNumber: string;
  status: string;
  priority: string;
  requester: string;
  estimatedHours?: number;
}

// Helper function to calculate end date/time accounting for 8-hour work days and excluding weekends
const calculateWorkEndTime = (startDate: Date, totalHours: number): Date => {
  const start = moment(startDate);
  let remainingHours = totalHours;
  let current = start.clone();

  // If start time is past 5 PM, move to next working day at 9 AM
  if (current.hour() >= 17) {
    current.add(1, 'day').hour(9).minute(0).second(0);
  }

  // Skip weekends for start date
  while (current.day() === 0 || current.day() === 6) {
    current.add(1, 'day');
  }

  // Calculate hours available on first day (from start time until 5 PM)
  const hoursLeftToday = Math.max(0, 17 - current.hour() - current.minute() / 60);

  if (remainingHours <= hoursLeftToday) {
    // Fits within first day
    return current.add(remainingHours, 'hours').toDate();
  }

  // Use up the rest of today
  remainingHours -= hoursLeftToday;
  current.hour(17).minute(0).second(0);

  // Add full 8-hour work days
  while (remainingHours > 0) {
    current.add(1, 'day').hour(9).minute(0).second(0);

    // Skip weekends
    while (current.day() === 0 || current.day() === 6) {
      current.add(1, 'day');
    }

    if (remainingHours <= 8) {
      // Last partial or full day
      return current.add(remainingHours, 'hours').toDate();
    }

    // Full 8-hour day consumed
    remainingHours -= 8;
    current.hour(17).minute(0).second(0);
  }

  return current.toDate();
}

export const ChangeCalendar: React.FC = () => {
  const { changes, fetchChanges, updateChange, isLoading } = useChangesStore();
  const { user } = useAuthStore();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  const [selectedEvent, setSelectedEvent] = useState<ChangeEvent | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editStartDate, setEditStartDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editDuration, setEditDuration] = useState('2');

  const [filters, setFilters] = useState({
    'Must Do': true,
    'Strategic': true,
    'Quick Fixes': true,
    'Reconsider': true,
  });

  const isCAB = user?.role === 'admin' || user?.role === 'Admin' || user?.role === 'CAB_Member' ||
                user?.role === 'Coordinator' || user?.role === 'cab_member' || user?.role === 'manager';

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  // Helper function to get Eisenhower quadrant from change
  const getEisenhowerQuadrant = (change: any): string => {
    const benefitScore = change.benefitScore || 0;
    const effortScore = change.effortScore || 0;

    if (benefitScore >= 50 && effortScore < 50) {
      return 'Must Do'; // High Benefit, Low Effort
    } else if (benefitScore >= 50 && effortScore >= 50) {
      return 'Strategic'; // High Benefit, High Effort
    } else if (benefitScore < 50 && effortScore >= 50) {
      return 'Reconsider'; // Low Benefit, High Effort
    } else {
      return 'Quick Fixes'; // Low Benefit, Low Effort
    }
  };

  // Changes ready for scheduling (approved but no schedule)
  const changesReadyForScheduling = changes
    .filter(change => {
      return change.status === 'approved' && !change.scheduledStart;
    })
    .map(change => {
      const wizardData = change.wizardData || {};
      const estimatedHours = Number(wizardData.estimatedEffortHours) || 2;
      const eisenhowerQuadrant = getEisenhowerQuadrant(change);

      return {
        id: change.id,
        title: change.title || 'Untitled Change',
        requestNumber: change.requestNumber || '',
        status: change.status,
        priority: eisenhowerQuadrant,
        requester: change.requester?.name || 'Unknown',
        estimatedHours,
        proposedDate: wizardData.proposedDate,
      };
    });

  // Convert change requests to calendar events (only those with schedules)
  const calendarEvents: ChangeEvent[] = changes
    .filter(change => {
      // Only show scheduled changes with actual schedule dates
      return (change.status === 'approved' || change.status === 'scheduled' ||
             change.status === 'in_progress' || change.status === 'implementing') &&
             (change.scheduledStart || change.wizardData?.proposedDate);
    })
    .map(change => {
      // Use scheduledStart if available, otherwise use proposedDate from wizardData
      const wizardData = change.wizardData || {};
      const proposedDate = change.scheduledStart || wizardData.proposedDate;

      if (!proposedDate) return null;

      const startDate = new Date(proposedDate);

      // Get estimated hours from wizardData, default to 2 if not available
      const estimatedHours = Number(wizardData.estimatedEffortHours) || 2;

      // Calculate end date using multi-day scheduling if scheduledEnd not already set
      const endDate = change.scheduledEnd
        ? new Date(change.scheduledEnd)
        : calculateWorkEndTime(startDate, estimatedHours);

      // Get Eisenhower quadrant based on benefit/effort scores
      const eisenhowerQuadrant = getEisenhowerQuadrant(change);

      return {
        id: change.id,
        title: change.title || 'Untitled Change',
        start: startDate,
        end: endDate,
        requestNumber: change.requestNumber || '',
        status: change.status,
        priority: eisenhowerQuadrant,
        requester: change.requester?.name || 'Unknown',
        estimatedHours,
      };
    })
    .filter((event): event is ChangeEvent => event !== null);

  const filteredEvents = calendarEvents.filter(
    (event) => filters[event.priority as keyof typeof filters]
  );

  const eventStyleGetter = (event: ChangeEvent) => {
    const priorityColors = {
      'Must Do': { backgroundColor: '#10b981', borderColor: '#059669' }, // Green
      'Strategic': { backgroundColor: '#3b82f6', borderColor: '#2563eb' }, // Blue
      'Quick Fixes': { backgroundColor: '#f59e0b', borderColor: '#d97706' }, // Yellow/Orange
      'Reconsider': { backgroundColor: '#ef4444', borderColor: '#dc2626' }, // Red
    };

    const colors = priorityColors[event.priority as keyof typeof priorityColors] || {
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

  const handleSelectEvent = useCallback((event: ChangeEvent) => {
    setSelectedEvent(event);
    setIsEditing(false);
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

  const handleEditClick = () => {
    if (selectedEvent) {
      // Pre-fill form with current values
      setEditStartDate(moment(selectedEvent.start).format('YYYY-MM-DD'));
      setEditStartTime(moment(selectedEvent.start).format('HH:mm'));
      // Use estimatedHours if available, otherwise calculate from end time
      const duration = selectedEvent.estimatedHours ||
                      moment(selectedEvent.end).diff(moment(selectedEvent.start), 'hours', true);
      setEditDuration(duration.toString());
      setIsEditing(true);
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedEvent) return;

    try {
      const startDateTime = moment(`${editStartDate} ${editStartTime}`, 'YYYY-MM-DD HH:mm').toDate();
      const durationHours = parseFloat(editDuration);

      // Use multi-day scheduling logic for end time (accounts for 8-hour days and weekends)
      const endDateTime = calculateWorkEndTime(startDateTime, durationHours);

      const updateData = {
        status: 'scheduled',
        scheduledStart: startDateTime.toISOString(),
        scheduledEnd: endDateTime.toISOString(),
      };

      console.log('Updating change with:', updateData);

      await updateChange(selectedEvent.id, updateData);

      toast.success('Schedule updated successfully!');
      setIsEditing(false);
      setSelectedEvent(null);
      fetchChanges();
    } catch (error) {
      toast.error('Failed to update schedule');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in_progress':
      case 'implementing':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      'Must Do': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Strategic': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Quick Fixes': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Reconsider': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {priority}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <style>{`
        /* Hide weekend columns in calendar views */
        .rbc-time-header-content > .rbc-row:first-child > .rbc-header:first-child,
        .rbc-time-header-content > .rbc-row:first-child > .rbc-header:last-child,
        .rbc-time-content > .rbc-time-column:first-child,
        .rbc-time-content > .rbc-time-column:last-child,
        .rbc-month-view .rbc-header:first-child,
        .rbc-month-view .rbc-header:last-child {
          display: none !important;
        }

        /* Adjust column widths after hiding weekends */
        .rbc-time-header-content,
        .rbc-time-content {
          grid-template-columns: auto repeat(5, 1fr) !important;
        }
      `}</style>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Change Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visual schedule of all approved and scheduled changes
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
            Filter by Eisenhower Matrix
          </h3>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters['Must Do']}
                onChange={() => toggleFilter('Must Do')}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Must Do
              </span>
              <div className="w-4 h-4 bg-green-500 rounded"></div>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters['Strategic']}
                onChange={() => toggleFilter('Strategic')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Strategic</span>
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters['Quick Fixes']}
                onChange={() => toggleFilter('Quick Fixes')}
                className="w-4 h-4 text-orange-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Quick Fixes</span>
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters['Reconsider']}
                onChange={() => toggleFilter('Reconsider')}
                className="w-4 h-4 text-red-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Reconsider
              </span>
              <div className="w-4 h-4 bg-red-500 rounded"></div>
            </label>
          </div>
        </div>
      )}

      {/* Calendar and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
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
                views={['month']}
                formats={{
                  dayFormat: (date, culture, localizer) =>
                    localizer?.format(date, 'ddd DD/MM', culture) || '',
                }}
              />
            </div>
          )}
        </div>

        {/* Event Details Sidebar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          {selectedEvent ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Change Details
              </h3>
              {!isEditing ? (
                <>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedEvent.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {selectedEvent.requestNumber}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Priority</p>
                      <div className="mt-1">{getPriorityBadge(selectedEvent.priority)}</div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedEvent.status)}
                        <p className="text-base font-semibold text-gray-900 dark:text-white capitalize">
                          {selectedEvent.status.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Requester</p>
                      <p className="text-base text-gray-900 dark:text-white">
                        {selectedEvent.requester}
                      </p>
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Duration</p>
                      <p className="text-base text-gray-900 dark:text-white">
                        {selectedEvent.estimatedHours || moment
                          .duration(
                            moment(selectedEvent.end).diff(moment(selectedEvent.start))
                          )
                          .asHours()
                          .toFixed(1)}{' '}
                        hours
                      </p>
                      {selectedEvent.estimatedHours && selectedEvent.estimatedHours > 8 && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Spans {Math.ceil(selectedEvent.estimatedHours / 8)} work days
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Link
                      to={`/changes/${selectedEvent.id}`}
                      className="w-full block px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition"
                    >
                      View Full Details
                    </Link>

                    {isCAB && (
                      <button
                        onClick={handleEditClick}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Edit Schedule
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Edit Schedule
                    </h4>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={editStartTime}
                        onChange={(e) => setEditStartTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duration (hours)
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                      {parseFloat(editDuration) > 8 && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Will span multiple work days (8 hours/day, excluding weekends)
                        </p>
                      )}
                    </div>
                  </div>

                  {editStartDate && editStartTime && editDuration && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Scheduled end:</strong>{' '}
                        {moment(
                          calculateWorkEndTime(
                            moment(`${editStartDate} ${editStartTime}`, 'YYYY-MM-DD HH:mm').toDate(),
                            parseFloat(editDuration)
                          )
                        ).format('MMMM D, YYYY h:mm A')}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 pt-4">
                    <button
                      onClick={handleSaveSchedule}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <Save size={16} />
                      Save Schedule
                    </button>

                    <button
                      onClick={() => setIsEditing(false)}
                      className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Changes Ready for Scheduling */}
              {changesReadyForScheduling.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Changes Ready for Scheduling
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Approved changes without a schedule - click to schedule
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {changesReadyForScheduling.map((change) => {
                      // Create a temporary event object for scheduling
                      const tempEvent: ChangeEvent = {
                        id: change.id,
                        title: change.title,
                        start: change.proposedDate ? new Date(change.proposedDate) : new Date(),
                        end: change.proposedDate ? calculateWorkEndTime(new Date(change.proposedDate), change.estimatedHours) : new Date(),
                        requestNumber: change.requestNumber,
                        status: change.status,
                        priority: change.priority,
                        requester: change.requester,
                        estimatedHours: change.estimatedHours,
                      };

                      return (
                        <div
                          key={change.id}
                          onClick={() => {
                            setSelectedEvent(tempEvent);
                            setIsEditing(true);
                            // Pre-fill form with proposed date or today
                            const startDate = change.proposedDate ? new Date(change.proposedDate) : new Date();
                            setEditStartDate(moment(startDate).format('YYYY-MM-DD'));
                            setEditStartTime(moment(startDate).format('HH:mm'));
                            setEditDuration(change.estimatedHours.toString());
                          }}
                          className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {change.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {change.requestNumber}
                              </p>
                            </div>
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            {getPriorityBadge(change.priority)}
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {change.estimatedHours}h estimated
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upcoming Changes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Upcoming Changes
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Next 3 scheduled changes
                </p>
                <div className="space-y-2">
                  {filteredEvents
                    .filter((event) => moment(event.start).isAfter(moment()))
                    .sort((a, b) => moment(a.start).diff(moment(b.start)))
                    .slice(0, 3)
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
                        <div className="mt-2">{getPriorityBadge(event.priority)}</div>
                      </div>
                    ))}
                  {filteredEvents.filter((event) => moment(event.start).isAfter(moment())).length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No upcoming scheduled changes</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangeCalendar;
