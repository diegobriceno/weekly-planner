'use client';

import { useState } from 'react';
import { Event } from '@/types/event';
import { Trash2, Check } from 'lucide-react';
import { categoryColors } from '@/constants/categoryConstants';
import DeleteConfirmModal from './modals/DeleteConfirmModal';

interface EventCardProps {
  event: Event;
  onDelete: (id: string) => void;
  onEdit: (event: Event) => void;
  onToggleComplete: (id: string) => void;
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
  onToggleComplete,
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

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(event.id);
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
          className={`${colors.bg} ${colors.border} border-l-4 border-t border-r border-b rounded-sm px-1 py-1 h-full group hover:shadow-md transition-all overflow-hidden flex flex-col relative ${isDragging ? 'opacity-40' : 'animate-in fade-in duration-200'} ${!event.seriesId ? 'cursor-move' : 'cursor-pointer'}`}
          title={`${event.name}${timeDisplay ? `\n${timeDisplay}` : ''}`}
        >
          {/* Action buttons - positioned absolutely */}
          <div className="absolute top-0 right-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={handleToggleComplete}
              className="hover:text-green-700 leading-none cursor-pointer p-1"
              aria-label={event.completed ? 'Mark as incomplete' : 'Mark as complete'}
              title={event.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              <Check strokeWidth={3} className={`w-3.5 h-3.5 ${event.completed ? 'text-green-700' : 'text-gray-400'}`} />
            </button>
            <button
              onClick={handleDeleteClick}
              className="text-gray-400 hover:text-red-600 leading-none cursor-pointer p-1"
              aria-label="Delete event"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex items-start min-h-0 pr-1">
            <p className={`text-xs font-semibold ${colors.text} leading-tight line-clamp-2 flex-1 min-w-0 break-words ${event.completed ? 'line-through opacity-60' : ''}`}>
              {event.name}
            </p>
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
        className={`${colors.bg} ${colors.border} border rounded ${padding} mb-1 group hover:shadow-sm transition-all relative ${isDragging ? 'opacity-40' : 'animate-in fade-in duration-200'} ${!event.seriesId ? 'cursor-move' : 'cursor-pointer'}`}
      >
        {/* Action buttons - positioned absolutely */}
        <div className="absolute top-0 right-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={handleToggleComplete}
            className="hover:text-green-700 leading-none cursor-pointer p-1"
            aria-label={event.completed ? 'Mark as incomplete' : 'Mark as complete'}
            title={event.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            <Check strokeWidth={3} className={`w-3.5 h-3.5 ${event.completed ? 'text-green-700' : 'text-gray-400'}`} />
          </button>
          <button
            onClick={handleDeleteClick}
            className="text-gray-400 hover:text-red-600 leading-none cursor-pointer p-1"
            aria-label="Delete event"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex items-baseline gap-2 pr-16">
          <p className={`text-xs font-medium ${colors.text} truncate ${event.completed ? 'line-through opacity-60' : ''}`}>
            {event.name}
          </p>
          {timeDisplay && (
            <span className={`text-xs font-bold ${colors.text} whitespace-nowrap ${event.completed ? 'opacity-60' : ''}`}>
              {timeDisplay}
            </span>
          )}
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
