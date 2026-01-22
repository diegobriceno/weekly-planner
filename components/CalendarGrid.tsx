import { Event } from '@/types/event';
import EventCard from './EventCard';
import { isHoliday, getHolidayName } from '@/services/holidays';

interface CalendarGridProps {
  days: Date[];
  currentMonth: number;
  events: { [date: string]: Event[] };
  weekDayNames: string[];
  onDayClick: (date: Date) => void;
  onDeleteEvent: (eventId: string) => void;
  onEditEvent: (event: Event) => void;
  onEventDrop?: (event: Event, targetDate: string) => void;
  dragOverDate?: string | null;
  onEventDragStart?: (event: Event) => void;
  onEventDragEnd?: () => void;
  draggedEvent?: Event | null;
}

export default function CalendarGrid({
  days,
  currentMonth,
  events,
  weekDayNames,
  onDayClick,
  onDeleteEvent,
  onEditEvent,
  onEventDrop,
  dragOverDate,
  onEventDragStart,
  onEventDragEnd,
  draggedEvent,
}: CalendarGridProps) {
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

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragOver = (e: React.DragEvent, _date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();

    try {
      const eventData = e.dataTransfer.getData('application/json');
      const event = JSON.parse(eventData) as Event;
      const targetDateKey = formatDateKey(date);

      if (onEventDrop) {
        onEventDrop(event, targetDateKey);
      }
    } catch (error) {
      console.error('Failed to parse dropped event:', error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {weekDayNames.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-medium text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const dateKey = formatDateKey(date);
          const dayEvents = events[dateKey] || [];
          const today = isToday(date);
          const currentMonthDay = isCurrentMonth(date);
          const holiday = isHoliday(dateKey);
          const holidayName = getHolidayName(dateKey);

          return (
            <div
              key={index}
              onClick={() => onDayClick(date)}
              onDragOver={(e) => handleDragOver(e, date)}
              onDrop={(e) => handleDrop(e, date)}
              className={`
                min-h-[120px] p-2 border-b border-r border-gray-200
                ${index % 7 === 6 ? 'border-r-0' : ''}
                ${index >= days.length - 7 ? 'border-b-0' : ''}
                ${!currentMonthDay ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}
                ${holiday ? 'border-t-3 border-t-red-500' : ''}
                ${dragOverDate === dateKey ? 'bg-blue-100 ring-2 ring-blue-400' : ''}
                transition-colors cursor-pointer
              `}
              title={holidayName || undefined}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-sm font-medium
                    ${!currentMonthDay ? 'text-gray-400' : 'text-gray-900'}
                    ${today ? 'bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs' : ''}
                  `}
                >
                  {date.getDate()}
                </span>
              </div>

              <div className="space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onDelete={onDeleteEvent}
                    onEdit={onEditEvent}
                    onDragStart={onEventDragStart}
                    onDragEnd={onEventDragEnd}
                    isDragging={draggedEvent?.id === event.id}
                    compact
                    hideTime
                  />
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-xs text-gray-500 pl-2">
                    +{dayEvents.length - 3} more...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
