'use client';

import { useState, useEffect } from 'react';
import { Category, Event, RecurrenceRule, RecurringEvent } from '@/types/event';
import { parseTime, combineTime, calculateEndTime, isEndTimeValid } from '@/utils/timeHelpers';
import { categories, startHourOptions, endHourOptions } from '@/constants/eventConstants';
import TimeSelector from '@/components/forms/TimeSelector';
import RecurrenceSelector from '@/components/forms/RecurrenceSelector';

interface AddEventModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  selectedHour: number | null;
  editingEvent: Event | null;
  recurringSeries: RecurringEvent[];
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    category: Category;
    startTime?: string;
    endTime?: string;
    recurrence?: RecurrenceRule;
    endDate?: string;
  }) => void;
}

export default function AddEventModal({
  isOpen,
  selectedDate,
  selectedHour,
  editingEvent,
  recurringSeries,
  onClose,
  onSubmit,
}: AddEventModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('personal');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startHour, setStartHour] = useState('');
  const [startMinute, setStartMinute] = useState('00');
  const [endHour, setEndHour] = useState('');
  const [endMinute, setEndMinute] = useState('00');
  const [repeatMode, setRepeatMode] = useState<'none' | 'day_of_week' | 'day_of_month'>('none');
  const [repeatDaysOfWeek, setRepeatDaysOfWeek] = useState<number[]>([]);
  const [repeatDayOfMonth, setRepeatDayOfMonth] = useState<number>(1);
  const [endDate, setEndDate] = useState<string>('');

  // Handler for start hour change - auto-calculates end time
  const handleStartHourChange = (newStartHour: string) => {
    setStartHour(newStartHour);
    if (newStartHour) {
      const calculatedEnd = calculateEndTime(newStartHour, startMinute);
      setEndHour(calculatedEnd.hour);
      setEndMinute(calculatedEnd.minute);
    }
  };

  // Handler for start minute change - auto-calculates end time
  const handleStartMinuteChange = (newStartMinute: string) => {
    setStartMinute(newStartMinute);
    if (startHour) {
      const calculatedEnd = calculateEndTime(startHour, newStartMinute);
      setEndHour(calculatedEnd.hour);
      setEndMinute(calculatedEnd.minute);
    }
  };

  // Update combined time when hour/minute change
  useEffect(() => {
    setStartTime(combineTime(startHour, startMinute));
  }, [startHour, startMinute]);

  useEffect(() => {
    setEndTime(combineTime(endHour, endMinute));
  }, [endHour, endMinute]);

  useEffect(() => {
    const seriesId = editingEvent?.seriesId || editingEvent?.id || null;
    const series = seriesId ? recurringSeries.find((r) => r.id === seriesId) : undefined;

    if (editingEvent) {
      setName(editingEvent.name);
      setCategory(editingEvent.category);

      // Parse start time
      const parsedStart = parseTime(editingEvent.startTime || '');
      setStartHour(parsedStart.hour);
      setStartMinute(parsedStart.minute);
      setStartTime(editingEvent.startTime || '');

      // Parse end time
      const parsedEnd = parseTime(editingEvent.endTime || '');
      setEndHour(parsedEnd.hour);
      setEndMinute(parsedEnd.minute);
      setEndTime(editingEvent.endTime || '');

      if (series) {
        if (series.recurrence.kind === 'day_of_week') {
          setRepeatMode('day_of_week');
          // Handle both single number and array of numbers
          const days = Array.isArray(series.recurrence.day)
            ? series.recurrence.day
            : [series.recurrence.day];
          setRepeatDaysOfWeek(days);
        } else {
          setRepeatMode('day_of_month');
          setRepeatDayOfMonth(series.recurrence.day as number);
        }
        setEndDate(series.endDate || '');
      } else {
        setRepeatMode('none');
        setEndDate('');
      }
    } else {
      setName('');
      setCategory('work');

      // Use selectedHour if available, otherwise default to 9 AM
      const defaultStartHour = selectedHour ?? 9;
      const defaultStartHourStr = defaultStartHour.toString().padStart(2, '0');
      const defaultEndHour = Math.min(defaultStartHour + 1, 22);
      const defaultEndHourStr = defaultEndHour.toString().padStart(2, '0');

      setStartHour(defaultStartHourStr);
      setStartMinute('00');
      setEndHour(defaultEndHourStr);
      setEndMinute('00');
      setStartTime(`${defaultStartHourStr}:00`);
      setEndTime(`${defaultEndHourStr}:00`);

      setRepeatMode('none');
      setEndDate('');
      // defaults based on selectedDate (if present)
      if (selectedDate) {
        setRepeatDaysOfWeek([selectedDate.getDay()]);
        setRepeatDayOfMonth(selectedDate.getDate());
      } else {
        setRepeatDaysOfWeek([1]);
        setRepeatDayOfMonth(1);
      }
    }
  }, [editingEvent, recurringSeries, selectedDate, selectedHour]);

  if (!isOpen || !selectedDate) return null;

  // Validate that end time is after start time
  const timeIsValid = isEndTimeValid(startHour, startMinute, endHour, endMinute);
  const hasTimeError = startHour && endHour && !timeIsValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      name.trim() &&
      startHour &&
      endHour &&
      timeIsValid &&
      (repeatMode !== 'day_of_week' || repeatDaysOfWeek.length > 0)
    ) {
      const trimmedName = name.trim();

      const seriesId = editingEvent?.seriesId || editingEvent?.id || null;
      const isEditingSeries = !!(editingEvent && seriesId && recurringSeries.some((r) => r.id === seriesId));

      const recurrence: RecurrenceRule | undefined =
        !editingEvent || isEditingSeries
          ? repeatMode === 'day_of_week'
            ? { kind: 'day_of_week', day: repeatDaysOfWeek.length === 1 ? repeatDaysOfWeek[0] : repeatDaysOfWeek }
            : repeatMode === 'day_of_month'
              ? { kind: 'day_of_month', day: repeatDayOfMonth }
              : undefined
          : undefined;

      onSubmit({
        name: trimmedName,
        category,
        startTime: startTime,
        endTime: endTime,
        recurrence,
        endDate: endDate || undefined,
      });
      setName('');
      setCategory('work');
      setStartHour('');
      setStartMinute('00');
      setEndHour('');
      setEndMinute('00');
      setStartTime('');
      setEndTime('');
      setRepeatMode('none');
      setRepeatDaysOfWeek([]);
      setEndDate('');
      onClose();
    }
  };

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isEditing = !!editingEvent;
  const seriesId = editingEvent?.seriesId || editingEvent?.id || null;
  const editingSeries = !!(isEditing && seriesId && recurringSeries.some((r) => r.id === seriesId));

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {isEditing ? 'Edit Event' : 'Add Event'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">{formattedDate}</p>
        {editingSeries && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            Editing a recurring event updates the whole series.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
              Event Name
            </label>
            <input
              type="text"
              id="eventName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Enter event name..."
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TimeSelector
              label="Start Time"
              hour={startHour}
              minute={startMinute}
              onHourChange={handleStartHourChange}
              onMinuteChange={handleStartMinuteChange}
              hourOptions={startHourOptions}
              required
            />
            <TimeSelector
              label="End Time"
              hour={endHour}
              minute={endMinute}
              onHourChange={setEndHour}
              onMinuteChange={setEndMinute}
              hourOptions={endHourOptions}
              required
              hasError={!!hasTimeError}
            />
          </div>

          {hasTimeError && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              End time must be after start time
            </div>
          )}

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent capitalize"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Recurrence controls (create new or edit series only) */}
          {(!isEditing || editingSeries) && (
            <RecurrenceSelector
              repeatMode={repeatMode}
              onRepeatModeChange={setRepeatMode}
              repeatDaysOfWeek={repeatDaysOfWeek}
              onRepeatDaysOfWeekChange={setRepeatDaysOfWeek}
              repeatDayOfMonth={repeatDayOfMonth}
              onRepeatDayOfMonthChange={setRepeatDayOfMonth}
              endDate={endDate}
              onEndDateChange={setEndDate}
            />
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !name.trim() ||
                !startHour ||
                !endHour ||
                !timeIsValid ||
                (repeatMode === 'day_of_week' && repeatDaysOfWeek.length === 0)
              }
              className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isEditing ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
