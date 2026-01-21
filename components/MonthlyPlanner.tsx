'use client';

import { useState, useEffect } from 'react';
import { Category, MonthEvents, Event } from '@/types/event';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import WeeklyView from './WeeklyView';
import AddEventModal from './AddEventModal';
import {
  addEventToMonth,
  updateEventInMonth,
  deleteEventFromMonth,
  getMonthDays,
  getWeekDays,
  formatDate,
  getMonthName,
  getWeekDayNames,
} from '@/services/eventHelpers';
import {
  fetchAllEvents,
  createEventApi,
  updateEventApi,
  deleteEventApi,
} from '@/services/eventApi';

/**
 * MonthlyPlanner - Container Component
 * Handles state management and orchestrates data flow for monthly calendar
 */
export default function MonthlyPlanner() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [monthEvents, setMonthEvents] = useState<MonthEvents>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentWeekStart, setCurrentWeekStart] = useState(today);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load events from API on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await fetchAllEvents();
      setMonthEvents(data);
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

  const handleAddEventClick = () => {
    setSelectedDate(new Date(currentYear, currentMonth, today.getDate()));
    setModalOpen(true);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleSubmitEvent = async (name: string, category: Category, time?: string) => {
    try {
      if (editingEvent) {
        // Update existing event via service (API)
        await updateEventApi(editingEvent.id, { name, category, time });
        // Update local state
        setMonthEvents(updateEventInMonth(monthEvents, editingEvent.id, { name, category, time }));
        setEditingEvent(null);
      } else if (selectedDate) {
        // Create new event via service (API)
        const dateString = formatDate(selectedDate);
        const newEvent = await createEventApi({ name, category, date: dateString, time });
        // Update local state
        setMonthEvents(addEventToMonth(monthEvents, newEvent));
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    // Parse the event date to create a Date object
    const [year, month, day] = event.date.split('-').map(Number);
    setSelectedDate(new Date(year, month - 1, day));
    setModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEventApi(eventId);
      // Update local state
      setMonthEvents(deleteEventFromMonth(monthEvents, eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingEvent(null);
  };

  const handleCategoryToggle = (category: Category | 'all') => {
    if (category === 'all') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories((prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category]
      );
    }
  };

  // Filter events based on selected categories
  const filterEvents = (events: MonthEvents): MonthEvents => {
    if (selectedCategories.length === 0) {
      return events;
    }

    const filtered: MonthEvents = {};
    Object.keys(events).forEach((date) => {
      const filteredDayEvents = events[date].filter((event) =>
        selectedCategories.includes(event.category)
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
  const filteredEvents = filterEvents(monthEvents);

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
          onAddEvent={handleAddEventClick}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          selectedCategories={selectedCategories}
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
          />
        ) : (
          <WeeklyView
            weekDays={weekDays}
            events={filteredEvents}
            onDayClick={handleDayClick}
            onDeleteEvent={handleDeleteEvent}
            onEditEvent={handleEditEvent}
          />
        )}
      </div>

      <AddEventModal
        isOpen={modalOpen}
        selectedDate={selectedDate}
        editingEvent={editingEvent}
        onClose={handleCloseModal}
        onSubmit={handleSubmitEvent}
      />
    </div>
  );
}
