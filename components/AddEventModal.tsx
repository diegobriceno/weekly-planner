'use client';

import { useState, useEffect } from 'react';
import { Category, Event, RecurrenceRule, RecurringEvent } from '@/types/event';

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

const categories: Category[] = ['work', 'projects', 'personal',  'home', 'finances', 'other'];
const weekDayOptions: { label: string; value: number }[] = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

// Generate hour options for start time (6am to 9pm - cannot start at 10pm)
const startHourOptions = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 6; // 6 to 21
  const display = hour === 0 ? '12 AM'
    : hour < 12 ? `${hour} AM`
    : hour === 12 ? '12 PM'
    : `${hour - 12} PM`;
  return { value: hour.toString().padStart(2, '0'), label: display };
});

// Generate hour options for end time (6am to 10pm)
const endHourOptions = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6; // 6 to 22
  const display = hour === 0 ? '12 AM'
    : hour < 12 ? `${hour} AM`
    : hour === 12 ? '12 PM'
    : `${hour - 12} PM`;
  return { value: hour.toString().padStart(2, '0'), label: display };
});

// Minute options: 00, 15, 30, 45
const minuteOptions = [
  { value: '00', label: '00' },
  { value: '15', label: '15' },
  { value: '30', label: '30' },
  { value: '45', label: '45' },
];

// Helper to parse time string into hour and minute
const parseTime = (time: string): { hour: string; minute: string } => {
  if (!time) return { hour: '', minute: '00' };
  const [h, m] = time.split(':');
  return { hour: h, minute: m || '00' };
};

// Helper to combine hour and minute into time string
const combineTime = (hour: string, minute: string): string => {
  if (!hour) return '';
  return `${hour}:${minute}`;
};

// Helper to calculate end time (1 hour after start)
const calculateEndTime = (startHour: string, startMinute: string): { hour: string; minute: string } => {
  if (!startHour) return { hour: '', minute: '00' };

  const startHourNum = parseInt(startHour, 10);
  const startMinuteNum = parseInt(startMinute, 10);

  // Add 1 hour
  let endHourNum = startHourNum + 1;
  const endMinuteNum = startMinuteNum;

  // Clamp to maximum 10 PM (22:00)
  if (endHourNum > 22) {
    endHourNum = 22;
  }

  return {
    hour: endHourNum.toString().padStart(2, '0'),
    minute: endMinuteNum.toString().padStart(2, '0'),
  };
};

// Helper to validate that end time is after start time
const isEndTimeValid = (
  startHour: string,
  startMinute: string,
  endHour: string,
  endMinute: string
): boolean => {
  if (!startHour || !endHour) return true; // Don't validate if either is empty

  const startMinutes = parseInt(startHour, 10) * 60 + parseInt(startMinute, 10);
  const endMinutes = parseInt(endHour, 10) * 60 + parseInt(endMinute, 10);

  return endMinutes > startMinutes;
};

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
        startTime: startTime, // Required now
        endTime: endTime, // Required now
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={startHour}
                  onChange={(e) => handleStartHourChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="">Hour</option>
                  {startHourOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={startMinute}
                  onChange={(e) => handleStartMinuteChange(e.target.value)}
                  disabled={!startHour}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {minuteOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent ${
                    hasTimeError
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-gray-900'
                  }`}
                >
                  <option value="">Hour</option>
                  {endHourOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={endMinute}
                  onChange={(e) => setEndMinute(e.target.value)}
                  disabled={!endHour}
                  className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 ${
                    hasTimeError && endHour
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-gray-900'
                  }`}
                >
                  {minuteOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-medium text-gray-700">
                Repeat
              </label>

              <select
                value={repeatMode}
                onChange={(e) => setRepeatMode(e.target.value as typeof repeatMode)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="none">Do not repeat</option>
                <option value="day_of_week">Every week (day of week)</option>
                <option value="day_of_month">Every month (day of month)</option>
              </select>

              {repeatMode === 'day_of_week' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days of week (select one or more)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {weekDayOptions.map((d) => (
                      <label
                        key={d.value}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={repeatDaysOfWeek.includes(d.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRepeatDaysOfWeek([...repeatDaysOfWeek, d.value].sort());
                            } else {
                              setRepeatDaysOfWeek(repeatDaysOfWeek.filter((day) => day !== d.value));
                            }
                          }}
                          className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                        />
                        <span className="text-sm text-gray-900">{d.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {repeatMode === 'day_of_month' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of month (1-31)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={repeatDayOfMonth}
                    onChange={(e) => setRepeatDayOfMonth(Math.max(1, Math.min(31, Number(e.target.value))))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              )}

              {repeatMode !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End date (optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              )}
            </div>
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
