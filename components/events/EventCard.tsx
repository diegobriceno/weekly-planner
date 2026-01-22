'use client';

import { useState } from 'react';
import { Event } from '@/types/event';
import { Trash2 } from 'lucide-react';
import { categoryColors } from '@/constants/categoryConstants';
import DeleteConfirmModal from './modals/DeleteConfirmModal';

interface EventCardProps {
  event: Event;
  onDelete: (id: string) => void;
  onEdit: (event: Event) => void;
  onDragStart?: (event: Event) => void;
  onDragEnd?: () => void;
  compact?: boolean;
  timeGrid?: boolean;
  hideTime?: boolean;
  isDragging?: boolean;
}

export default function EventCard({
  event,
  onDelete,
  onEdit,
  onDragStart,
  onDragEnd,
  compact = false,
  timeGrid = false,
  hideTime = false,
  isDragging = false
}: EventCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const colors = categoryColors[event.category].card;
  const padding = compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  const timeDisplay = !hideTime && (event.startTime && event.endTime
    ? `${event.startTime} - ${event.endTime}`
    : event.startTime || '');

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

  const handleDragStart = (e: React.DragEvent) => {
    if (event.seriesId) {
      e.preventDefault(); // Do not allow dragging recurring events
      return;
    }

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(event));

    if (onDragStart) {
      onDragStart(event);
    }
  };

  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleEditClick = () => {
    onEdit(event);
  };

  // Time grid mode: vertical layout with full height
  if (timeGrid) {
    return (
      <>
        <div
          draggable={!event.seriesId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onClick={handleEditClick}
          className={`${colors.bg} ${colors.border} border-l-4 border-t border-r border-b rounded-sm px-1 py-1 h-full group hover:shadow-md transition-all overflow-hidden flex flex-col relative ${isDragging ? 'opacity-40' : ''} ${!event.seriesId ? 'cursor-move' : 'cursor-pointer'}`}
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
              <Trash2 className="w-4 h-4" />
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
        draggable={!event.seriesId}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleEditClick}
        className={`${colors.bg} ${colors.border} border rounded ${padding} mb-1 group hover:shadow-sm transition-all ${isDragging ? 'opacity-40' : ''} ${!event.seriesId ? 'cursor-move' : 'cursor-pointer'}`}
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
            <Trash2 className="w-4 h-4" />
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
