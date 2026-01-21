'use client';

import { useState, useEffect } from 'react';
import { Category, Event, RecurrenceRule, RecurringEvent } from '@/types/event';

interface AddEventModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  editingEvent: Event | null;
  recurringSeries: RecurringEvent[];
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    category: Category;
    time?: string;
    recurrence?: RecurrenceRule;
    endDate?: string;
  }) => void;
}

const categories: Category[] = ['work', 'projects', 'personal',  'home', 'benja', 'sophi', 'other'];
const weekDayOptions: { label: string; value: number }[] = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

export default function AddEventModal({
  isOpen,
  selectedDate,
  editingEvent,
  recurringSeries,
  onClose,
  onSubmit,
}: AddEventModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('personal');
  const [time, setTime] = useState('');
  const [repeatMode, setRepeatMode] = useState<'none' | 'day_of_week' | 'day_of_month'>('none');
  const [repeatDayOfWeek, setRepeatDayOfWeek] = useState<number>(1);
  const [repeatDayOfMonth, setRepeatDayOfMonth] = useState<number>(1);
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const seriesId = editingEvent?.seriesId || editingEvent?.id || null;
    const series = seriesId ? recurringSeries.find((r) => r.id === seriesId) : undefined;

    if (editingEvent) {
      setName(editingEvent.name);
      setCategory(editingEvent.category);
      setTime(editingEvent.time || '');

      if (series) {
        if (series.recurrence.kind === 'day_of_week') {
          setRepeatMode('day_of_week');
          setRepeatDayOfWeek(series.recurrence.day);
        } else {
          setRepeatMode('day_of_month');
          setRepeatDayOfMonth(series.recurrence.day);
        }
        setEndDate(series.endDate || '');
      } else {
        setRepeatMode('none');
        setEndDate('');
      }
    } else {
      setName('');
      setCategory('personal');
      setTime('');
      setRepeatMode('none');
      setEndDate('');
      // defaults based on selectedDate (if present)
      if (selectedDate) {
        setRepeatDayOfWeek(selectedDate.getDay());
        setRepeatDayOfMonth(selectedDate.getDate());
      } else {
        setRepeatDayOfWeek(1);
        setRepeatDayOfMonth(1);
      }
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [editingEvent, recurringSeries, selectedDate]);

  if (!isOpen || !selectedDate) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const trimmedName = name.trim();

      const seriesId = editingEvent?.seriesId || editingEvent?.id || null;
      const isEditingSeries = !!(editingEvent && seriesId && recurringSeries.some((r) => r.id === seriesId));

      const recurrence: RecurrenceRule | undefined =
        !editingEvent || isEditingSeries
          ? repeatMode === 'day_of_week'
            ? { kind: 'day_of_week', day: repeatDayOfWeek }
            : repeatMode === 'day_of_month'
              ? { kind: 'day_of_month', day: repeatDayOfMonth }
              : undefined
          : undefined;

      onSubmit({
        name: trimmedName,
        category,
        time: time || undefined,
        recurrence,
        endDate: endDate || undefined,
      });
      setName('');
      setCategory('personal');
      setTime('');
      setRepeatMode('none');
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

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
              Time (Optional)
            </label>
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

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
                    Day of week
                  </label>
                  <select
                    value={repeatDayOfWeek}
                    onChange={(e) => setRepeatDayOfWeek(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    {weekDayOptions.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
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
              className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium"
            >
              {isEditing ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
