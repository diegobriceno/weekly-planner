import { Event, Category, MonthEvents } from '@/types/event';

export function createEvent(
  name: string,
  category: Category,
  date: string,
  time?: string
): Event {
  return {
    id: generateEventId(),
    name,
    category,
    date,
    time,
  };
}

export function addEventToMonth(monthEvents: MonthEvents, event: Event): MonthEvents {
  const dateEvents = monthEvents[event.date] || [];
  return {
    ...monthEvents,
    [event.date]: [...dateEvents, event],
  };
}

export function updateEventInMonth(
  monthEvents: MonthEvents,
  eventId: string,
  updates: { name: string; category: Category; time?: string }
): MonthEvents {
  const updatedMonth: MonthEvents = {};

  Object.keys(monthEvents).forEach((date) => {
    updatedMonth[date] = monthEvents[date].map((event) =>
      event.id === eventId ? { ...event, name: updates.name, category: updates.category, time: updates.time } : event
    );
  });

  return updatedMonth;
}

export function deleteEventFromMonth(monthEvents: MonthEvents, eventId: string): MonthEvents {
  const updatedMonth: MonthEvents = {};

  Object.keys(monthEvents).forEach((date) => {
    const filteredEvents = monthEvents[date].filter((event) => event.id !== eventId);
    if (filteredEvents.length > 0) {
      updatedMonth[date] = filteredEvents;
    }
  });

  return updatedMonth;
}

export function getEventsForDate(monthEvents: MonthEvents, date: string): Event[] {
  return monthEvents[date] || [];
}

function generateEventId(): string {
  return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days: Date[] = [];

  // Add padding days from previous month
  const firstDayOfWeek = firstDay.getDay();
  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Monday = 0

  for (let i = paddingDays; i > 0; i--) {
    const date = new Date(year, month, -i + 1);
    days.push(date);
  }

  // Add days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  // Add padding days from next month to complete the grid
  const remainingDays = 42 - days.length; // 6 rows × 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMonthName(month: number): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[month] || '';
}

export function getWeekDayNames(): string[] {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isCurrentMonth(date: Date, currentMonth: number): boolean {
  return date.getMonth() === currentMonth;
}

export function getWeekDays(year: number, month: number, weekStart: Date): Date[] {
  const days: Date[] = [];
  const startDate = new Date(weekStart);

  // Get Monday of the week
  const dayOfWeek = startDate.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // adjust when day is Sunday
  startDate.setDate(startDate.getDate() + diff);

  // Get 7 days starting from Monday
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }

  return days;
}

export function getCurrentWeekDays(): Date[] {
  const today = new Date();
  return getWeekDays(today.getFullYear(), today.getMonth(), today);
}
