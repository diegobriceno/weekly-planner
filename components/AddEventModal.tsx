'use client';

import { useState, useEffect } from 'react';
import { Category, Event } from '@/types/event';

interface AddEventModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  editingEvent: Event | null;
  onClose: () => void;
  onSubmit: (name: string, category: Category, time?: string) => void;
}

const categories: Category[] = ['work', 'projects', 'personal',  'home', 'benja', 'sophi', 'other'];

export default function AddEventModal({
  isOpen,
  selectedDate,
  editingEvent,
  onClose,
  onSubmit,
}: AddEventModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('personal');
  const [time, setTime] = useState('');

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (editingEvent) {
      setName(editingEvent.name);
      setCategory(editingEvent.category);
      setTime(editingEvent.time || '');
    } else {
      setName('');
      setCategory('personal');
      setTime('');
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [editingEvent]);

  if (!isOpen || !selectedDate) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), category, time || undefined);
      setName('');
      setCategory('personal');
      setTime('');
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
