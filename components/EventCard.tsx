'use client';

import { useState } from 'react';
import { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  onDelete: (id: string) => void;
  onEdit: (event: Event) => void;
  compact?: boolean;
  timeGrid?: boolean;
}

const categoryColors: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  work: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  projects: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-200' },
  personal: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500', border: 'border-yellow-200' },
  home: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
  finances: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
  other: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500', border: 'border-gray-200' },
};

// Trash icon SVG component
function TrashIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmModal({
  eventName,
  onConfirm,
  onCancel,
}: {
  eventName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl"
        onClick={handleModalClick}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <TrashIcon />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Delete Event</h3>
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-700">&quot;{eventName}&quot;</span>?
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EventCard({ event, onDelete, onEdit, compact = false, timeGrid = false }: EventCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const colors = categoryColors[event.category];
  const padding = compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  const timeDisplay = event.startTime && event.endTime
    ? `${event.startTime} - ${event.endTime}`
    : event.startTime || '';

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    onDelete(event.seriesId || event.id);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Time grid mode: vertical layout with full height
  if (timeGrid) {
    return (
      <>
        <div
          onClick={() => onEdit(event)}
          className={`${colors.bg} ${colors.border} border-l-4 border-t border-r border-b rounded-sm px-1 py-1 h-full group hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col relative`}
          title={`${event.name}${timeDisplay ? `\n${timeDisplay}` : ''}`}
        >
          <div className="flex items-start justify-between gap-0.5 min-h-0">
            <p className={`text-xs font-semibold ${colors.text} leading-tight line-clamp-2 flex-1 min-w-0 break-words`}>
              {event.name}
            </p>
            <button
              onClick={handleDeleteClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 flex-shrink-0 leading-none cursor-pointer p-0.5"
              aria-label="Delete event"
            >
              <TrashIcon />
            </button>
          </div>
          {timeDisplay && (
            <p className={`text-[10px] ${colors.text} opacity-75 leading-tight truncate`}>
              {timeDisplay}
            </p>
          )}
        </div>
        {showDeleteModal && (
          <DeleteConfirmModal
            eventName={event.name}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        )}
      </>
    );
  }

  // Regular mode: horizontal compact layout
  return (
    <>
      <div
        onClick={() => onEdit(event)}
        className={`${colors.bg} ${colors.border} border rounded ${padding} mb-1 group hover:shadow-sm transition-all cursor-pointer`}
      >
        <div className="flex items-start gap-1.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <p className={`text-xs font-medium ${colors.text} truncate`}>
                {event.name}
              </p>
              {timeDisplay && (
                <span className={`text-xs font-bold ${colors.text}`}>
                  {timeDisplay}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleDeleteClick}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 flex-shrink-0 cursor-pointer p-0.5"
            aria-label="Delete event"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      {showDeleteModal && (
        <DeleteConfirmModal
          eventName={event.name}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
}
