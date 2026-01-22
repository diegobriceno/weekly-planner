'use client';

import { useState, useEffect } from 'react';
import { Category, Event, MonthEvents, RecurrenceRule, RecurringEvent, StoredEvents } from '@/types/event';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import WeeklyView from './WeeklyView';
import AddEventModal from '@/components/events/AddEventModal';
import {
  addEventToMonth,
  updateEventInMonth,
  deleteEventFromMonth,
  moveEventToNewDate,
} from '@/services/events/operations';
import {
  fetchAllEvents,
  createEventApi,
  updateEventApi,
  deleteEventApi,
} from '@/services/events/api';
import {
  expandRecurringEventsForDates,
  mergeEvents,
} from '@/services/events/recurring';
import {
  getMonthDays,
  getWeekDays,
} from '@/services/calendar/calendarUtils';
import {
  formatDate,
  getMonthName,
  getWeekDayNames,
} from '@/services/calendar/dateUtils';
import {
  calculateEventDuration,
  validateTimeWithinBounds,
  calculateNewEndTime,
} from '@/services/dragDrop/helpers';

/**
 * MonthlyPlanner - Container Component
 * Handles state management and orchestrates data flow for monthly calendar
 */
export default function MonthlyPlanner() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [storedEvents, setStoredEvents] = useState<StoredEvents>({ byDate: {}, recurring: [] });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');
  const [currentWeekStart, setCurrentWeekStart] = useState(today);
  const [disabledCategories, setDisabledCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [dragOverTime, setDragOverTime] = useState<{ hour: number; minute: number } | null>(null);

  // Load events from API on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await fetchAllEvents();
      setStoredEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    if (viewMode === 'month') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      // Previous week
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() - 7);
      setCurrentWeekStart(newWeekStart);
      setCurrentMonth(newWeekStart.getMonth());
      setCurrentYear(newWeekStart.getFullYear());
    }
  };

  const handleNextMonth = () => {
    if (viewMode === 'month') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      // Next week
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() + 7);
      setCurrentWeekStart(newWeekStart);
      setCurrentMonth(newWeekStart.getMonth());
      setCurrentYear(newWeekStart.getFullYear());
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setCurrentWeekStart(now);
  };

  const handleViewModeChange = (mode: 'month' | 'week') => {
    setViewMode(mode);
    if (mode === 'week') {
      // Initialize week view with current date
      setCurrentWeekStart(new Date(currentYear, currentMonth, today.getDate()));
    }
  };

  const handleDayClick = (date: Date, hour?: number) => {
    setSelectedDate(date);
    setSelectedHour(hour ?? null);
    setModalOpen(true);
  };

  const handleSubmitEvent = async (
    input: {
      name: string;
      category: Category;
      startTime?: string;
      endTime?: string;
      recurrence?: RecurrenceRule;
      endDate?: string;
    }
  ) => {
    try {
      const { name, category, startTime, endTime, recurrence, endDate } = input;
      if (editingEvent) {
        const targetId = editingEvent.seriesId || editingEvent.id;

        // Update recurring series vs one-off event via API
        await updateEventApi(targetId, { name, category, startTime, endTime, recurrence, endDate });

        // Update local state (optimistic)
        if (editingEvent.seriesId) {
          setStoredEvents((prev) => ({
            ...prev,
            recurring: prev.recurring.map((r) =>
              r.id === targetId
                ? {
                    ...r,
                    name,
                    category,
                    startTime,
                    endTime,
                    ...(recurrence ? { recurrence } : {}),
                    ...(endDate !== undefined ? { endDate } : {}),
                  }
                : r
            ),
          }));
        } else {
          setStoredEvents((prev) => ({
            ...prev,
            byDate: updateEventInMonth(prev.byDate, targetId, { name, category, startTime, endTime }),
          }));
        }
        setEditingEvent(null);
      } else if (selectedDate) {
        // Create new event via service (API)
        const dateString = formatDate(selectedDate);
        const created = await createEventApi({
          name,
          category,
          date: dateString,
          startTime,
          endTime,
          recurrence,
          endDate,
        });

        // Update local state
        if ('recurrence' in created) {
          setStoredEvents((prev) => ({ ...prev, recurring: [...prev.recurring, created as RecurringEvent] }));
        } else {
          setStoredEvents((prev) => ({ ...prev, byDate: addEventToMonth(prev.byDate, created as Event) }));
        }
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEventDrop = async (
    event: Event,
    targetDate: string,
    targetTime?: { hour: number; minute: number }
  ) => {
    try {
      // Validation: cannot move recurring event instances
      if (event.seriesId) {
        console.warn('Cannot move recurring event instances');
        return;
      }

      // Calculate duration if event has times
      let newStartTime = event.startTime;
      let newEndTime = event.endTime;

      if (targetTime && event.startTime && event.endTime) {
        // Weekly view: calculate new times preserving duration
        const duration = calculateEventDuration(event.startTime, event.endTime);
        newStartTime = `${String(targetTime.hour).padStart(2, '0')}:${String(targetTime.minute).padStart(2, '0')}`;

        // Validate limits
        if (!validateTimeWithinBounds(newStartTime, duration)) {
          console.error('Event would exceed 10 PM time limit');
          return;
        }

        newEndTime = calculateNewEndTime(newStartTime, duration);
      }

      // Update via API
      await updateEventApi(event.id, {
        date: targetDate,
        startTime: newStartTime,
        endTime: newEndTime,
      });

      // Update local state (optimistic)
      setStoredEvents((prev) => ({
        ...prev,
        byDate: moveEventToNewDate(
          prev.byDate,
          event.id,
          targetDate,
          newStartTime,
          newEndTime
        ),
      }));
    } catch (error) {
      console.error('Error moving event:', error);
    } finally {
      setDraggedEvent(null);
      setDragOverDate(null);
      setDragOverTime(null);
    }
  };

  const handleEditEvent = (event: Event) => {
    // If it's a recurring instance, edit the series (whole series)
    if (event.seriesId) {
      const series = storedEvents.recurring.find((r) => r.id === event.seriesId);
      if (series) {
        // Represent series in the modal using the clicked day as context
        setEditingEvent({ ...event, id: series.id, seriesId: series.id });
        const [year, month, day] = event.date.split('-').map(Number);
        setSelectedDate(new Date(year, month - 1, day));
      } else {
        setEditingEvent(event);
        const [year, month, day] = event.date.split('-').map(Number);
        setSelectedDate(new Date(year, month - 1, day));
      }
    } else {
      setEditingEvent(event);
      // Parse the event date to create a Date object
      const [year, month, day] = event.date.split('-').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
    }
    setModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEventApi(eventId);
      // Update local state
      setStoredEvents((prev) => {
        const isRecurring = prev.recurring.some((r) => r.id === eventId);
        if (isRecurring) {
          return { ...prev, recurring: prev.recurring.filter((r) => r.id !== eventId) };
        }
        return { ...prev, byDate: deleteEventFromMonth(prev.byDate, eventId) };
      });
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingEvent(null);
    setSelectedHour(null);
  };

  const handleCategoryToggle = (category: Category | 'all') => {
    if (category === 'all') {
      // If any categories are active (not all disabled), disable all
      // If all are disabled, enable all
      const allCategories: Category[] = ['work', 'projects', 'personal', 'home', 'finances', 'other'];
      if (disabledCategories.length < allCategories.length) {
        setDisabledCategories(allCategories);
      } else {
        setDisabledCategories([]);
      }
    } else {
      // Toggle the disabled state of the category
      setDisabledCategories((prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category]
      );
    }
  };

  // Filter events based on disabled categories
  const filterEvents = (events: MonthEvents): MonthEvents => {
    if (disabledCategories.length === 0) {
      return events;
    }

    const filtered: MonthEvents = {};
    Object.keys(events).forEach((date) => {
      const filteredDayEvents = events[date].filter((event) =>
        !disabledCategories.includes(event.category)
      );
      if (filteredDayEvents.length > 0) {
        filtered[date] = filteredDayEvents;
      }
    });
    return filtered;
  };

  const monthDays = getMonthDays(currentYear, currentMonth);
  const weekDays = getWeekDays(currentYear, currentMonth, currentWeekStart);
  const monthName = getMonthName(currentMonth);
  const weekDayNames = getWeekDayNames();
  const visibleDateKeys =
    viewMode === 'month'
      ? monthDays.map((d) => formatDate(d))
      : weekDays.map((d) => formatDate(d));
  const expandedRecurring = expandRecurringEventsForDates(storedEvents.recurring, visibleDateKeys);
  const mergedForView = mergeEvents(storedEvents.byDate, expandedRecurring);
  const filteredEvents = filterEvents(mergedForView);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <CalendarHeader
          currentMonth={currentMonth}
          currentYear={currentYear}
          monthName={monthName}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          disabledCategories={disabledCategories}
          onCategoryToggle={handleCategoryToggle}
        />

        {viewMode === 'month' ? (
          <CalendarGrid
            days={monthDays}
            currentMonth={currentMonth}
            events={filteredEvents}
            weekDayNames={weekDayNames}
            onDayClick={handleDayClick}
            onDeleteEvent={handleDeleteEvent}
            onEditEvent={handleEditEvent}
            onEventDrop={handleEventDrop}
            dragOverDate={dragOverDate}
            onEventDragStart={setDraggedEvent}
            onEventDragEnd={() => setDraggedEvent(null)}
            draggedEvent={draggedEvent}
            onDragOverDate={setDragOverDate}
          />
        ) : (
          <WeeklyView
            weekDays={weekDays}
            events={filteredEvents}
            onDayClick={handleDayClick}
            onDeleteEvent={handleDeleteEvent}
            onEditEvent={handleEditEvent}
            onEventDrop={handleEventDrop}
            dragOverDate={dragOverDate}
            dragOverTime={dragOverTime}
            onEventDragStart={setDraggedEvent}
            onEventDragEnd={() => setDraggedEvent(null)}
            draggedEvent={draggedEvent}
            onDragOverDate={setDragOverDate}
          />
        )}
      </div>

      <AddEventModal
        isOpen={modalOpen}
        selectedDate={selectedDate}
        selectedHour={selectedHour}
        editingEvent={editingEvent}
        recurringSeries={storedEvents.recurring}
        onClose={handleCloseModal}
        onSubmit={handleSubmitEvent}
      />
    </div>
  );
}
