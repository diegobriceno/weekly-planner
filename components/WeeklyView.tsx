import { useState } from 'react';
import { Event } from '@/types/event';
import EventCard from './EventCard';
import {
  formatHourDisplay,
  calculateEventPosition,
  calculateEventLayout,
} from '@/services/eventHelpers';
import { isHoliday, getHolidayName } from '@/services/holidays';
import { calculateTimeFromPosition } from '@/services/dragDropHelpers';

interface WeeklyViewProps {
  weekDays: Date[];
  events: { [date: string]: Event[] };
  onDayClick: (date: Date, hour?: number) => void;
  onDeleteEvent: (eventId: string) => void;
  onEditEvent: (event: Event) => void;
  onEventDrop?: (event: Event, targetDate: string, targetTime: { hour: number; minute: number }) => void;
  dragOverDate?: string | null;
  dragOverTime?: { hour: number; minute: number } | null;
  onEventDragStart?: (event: Event) => void;
  onEventDragEnd?: () => void;
  draggedEvent?: Event | null;
  onDragOverDate?: (date: string | null) => void;
}

export default function WeeklyView({
  weekDays,
  events,
  onDayClick,
  onDeleteEvent,
  onEditEvent,
  onEventDrop,
  dragOverDate,
  dragOverTime: _dragOverTime, // eslint-disable-line @typescript-eslint/no-unused-vars
  onEventDragStart,
  onEventDragEnd,
  draggedEvent,
  onDragOverDate,
}: WeeklyViewProps) {
  const [dropPreview, setDropPreview] = useState<{
    date: string;
    hour: number;
    minute: number;
  } | null>(null);

  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const calculateClickedHour = (e: React.MouseEvent<HTMLDivElement>): number => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const clickY = e.clientY - rect.top;

    // Each hour = 80px, grid starts at 6 AM (16 rows total)
    const hourHeight = rect.height / 16; // Dynamic for responsiveness
    const hourIndex = Math.floor(clickY / hourHeight);
    const clickedHour = Math.min(Math.max(hourIndex + 6, 6), 21);

    return clickedHour;
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const time = calculateTimeFromPosition(clickY, rect.height, 6);

    const targetDateKey = formatDateKey(date);

    setDropPreview({
      date: targetDateKey,
      hour: time.hour,
      minute: time.minute,
    });

    // Update parent drag over state
    if (onDragOverDate) {
      onDragOverDate(targetDateKey);
    }
  };

  const handleDragLeave = () => {
    setDropPreview(null);

    // Clear parent drag over state
    if (onDragOverDate) {
      onDragOverDate(null);
    }
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();

    try {
      const eventData = e.dataTransfer.getData('application/json');
      const event = JSON.parse(eventData) as Event;

      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const time = calculateTimeFromPosition(clickY, rect.height, 6);

      const targetDateKey = formatDateKey(date);

      if (onEventDrop) {
        onEventDrop(event, targetDateKey, time);
      }
    } catch (error) {
      console.error('Failed to parse dropped event:', error);
    } finally {
      setDropPreview(null);

      // Clear parent drag over state
      if (onDragOverDate) {
        onDragOverDate(null);
      }
    }
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm (labels)

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header with day names */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-200">
        <div className="bg-gray-50" /> {/* Empty corner */}
        {weekDays.map((date, index) => {
          const today = isToday(date);
          const dateKey = formatDateKey(date);
          const holiday = isHoliday(dateKey);
          const holidayName = getHolidayName(dateKey);
          return (
            <div
              key={index}
              className={`p-3 text-center border-l border-gray-200 ${
                holiday ? 'border-t-3 border-t-red-500' : ''
              }`}
              title={holidayName || undefined}
            >
              <p className="text-xs font-medium text-gray-500 mb-1">
                {dayNames[index]}
              </p>
              <p
                className={`text-sm font-semibold inline-flex items-center justify-center ${
                  today
                    ? 'bg-gray-900 text-white w-7 h-7 rounded-full'
                    : 'text-gray-900'
                }`}
              >
                {date.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] relative">
        {/* Hours column */}
        <div className="bg-gray-50 border-r border-gray-200">
          {hours.map(hour => (
            <div key={hour} className="h-20 border-t border-gray-200 relative">
              <span className="absolute -top-2 left-2 bg-gray-50 px-1 text-xs text-gray-600">
                {formatHourDisplay(hour)}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((date, dayIndex) => {
          const dateKey = formatDateKey(date);
          const dayEvents = events[dateKey] || [];
          // Only show events with both start and end time
          const timedEvents = dayEvents.filter(e => e.startTime && e.endTime);
          const holiday = isHoliday(dateKey);

          return (
            <div
              key={dayIndex}
              className={`relative border-l border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                holiday ? 'bg-red-50/30' : ''
              } ${dragOverDate === dateKey ? 'bg-blue-50' : ''}`}
              onDragOver={(e) => handleDragOver(e, date)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, date)}
              onClick={(e) => {
                const hour = calculateClickedHour(e);
                onDayClick(date, hour);
              }}
            >
              {/* Grid lines (hour rows) */}
              {hours.map(hour => (
                <div key={hour} className="h-20 border-t border-gray-200" />
              ))}

              {/* Drop preview indicator */}
              {dropPreview && dropPreview.date === dateKey && (
                <div
                  className="absolute left-0 right-0 h-1 bg-blue-500 z-10 pointer-events-none"
                  style={{
                    top: `${((dropPreview.hour - 6) * 60 + dropPreview.minute) / (16 * 60) * 100}%`,
                  }}
                >
                  <div className="absolute -top-3 left-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                    {`${String(dropPreview.hour).padStart(2, '0')}:${String(dropPreview.minute).padStart(2, '0')}`}
                  </div>
                </div>
              )}

              {/* Timed events (positioned absolutely) */}
              {timedEvents.map(event => {
                const position = calculateEventPosition(event.startTime!, event.endTime!);
                const layout = calculateEventLayout(event, timedEvents);

                return (
                  <div
                    key={event.id}
                    className="absolute pr-0.5"
                    style={{
                      top: position.top,
                      height: position.height,
                      width: layout.width,
                      left: layout.left,
                      minHeight: '20px',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEvent(event);
                    }}
                  >
                    <EventCard
                      event={event}
                      onDelete={onDeleteEvent}
                      onEdit={onEditEvent}
                      onDragStart={onEventDragStart}
                      onDragEnd={onEventDragEnd}
                      isDragging={draggedEvent?.id === event.id}
                      timeGrid
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
