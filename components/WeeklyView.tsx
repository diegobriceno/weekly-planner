import { Event } from '@/types/event';
import EventCard from './EventCard';
import {
  formatHourDisplay,
  calculateEventPosition,
  calculateEventLayout,
} from '@/services/eventHelpers';

interface WeeklyViewProps {
  weekDays: Date[];
  events: { [date: string]: Event[] };
  onDayClick: (date: Date) => void;
  onDeleteEvent: (eventId: string) => void;
  onEditEvent: (event: Event) => void;
}

export default function WeeklyView({
  weekDays,
  events,
  onDayClick,
  onDeleteEvent,
  onEditEvent,
}: WeeklyViewProps) {
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

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm (labels)

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header with day names */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-200">
        <div className="bg-gray-50" /> {/* Empty corner */}
        {weekDays.map((date, index) => {
          const today = isToday(date);
          return (
            <div key={index} className="p-3 text-center border-l border-gray-200">
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

          return (
            <div
              key={dayIndex}
              className="relative border-l border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onDayClick(date)}
            >
              {/* Grid lines (hour rows) */}
              {hours.map(hour => (
                <div key={hour} className="h-20 border-t border-gray-200" />
              ))}

              {/* Timed events (positioned absolutely) */}
              {timedEvents.map(event => {
                const position = calculateEventPosition(event.startTime!, event.endTime!);
                const layout = calculateEventLayout(event, timedEvents);

                return (
                  <div
                    key={event.id}
                    className="absolute px-0.5"
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
