import { Event, Category, MonthEvents, RecurringEvent } from '@/types/event';

export function createEvent(
  name: string,
  category: Category,
  date: string,
  startTime?: string,
  endTime?: string
): Event {
  return {
    id: generateEventId(),
    name,
    category,
    date,
    startTime,
    endTime,
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
  updates: { name: string; category: Category; startTime?: string; endTime?: string }
): MonthEvents {
  const updatedMonth: MonthEvents = {};

  Object.keys(monthEvents).forEach((date) => {
    updatedMonth[date] = monthEvents[date].map((event) =>
      event.id === eventId ? { ...event, name: updates.name, category: updates.category, startTime: updates.startTime, endTime: updates.endTime } : event
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

function parseIsoDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function compareIso(a: string, b: string): number {
  // YYYY-MM-DD lexicographic compare works
  return a < b ? -1 : a > b ? 1 : 0;
}

function isDateInRange(date: string, start: string, end?: string): boolean {
  if (compareIso(date, start) < 0) return false;
  if (end && compareIso(date, end) > 0) return false;
  return true;
}

function makeInstanceId(seriesId: string, date: string): string {
  return `${seriesId}__${date}`;
}

function sortEventsByTime(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const at = a.startTime || '';
    const bt = b.startTime || '';
    if (at === bt) return a.name.localeCompare(b.name);
    // empty time goes last
    if (!at) return 1;
    if (!bt) return -1;
    return at.localeCompare(bt);
  });
}

/**
 * Expands recurring series into concrete instances for the given date keys.
 * Returned instances have `seriesId` pointing to the recurring series ID and
 * a stable per-day `id` so the UI can key lists reliably.
 */
export function expandRecurringEventsForDates(
  recurring: RecurringEvent[],
  dateKeys: string[]
): MonthEvents {
  const out: MonthEvents = {};

  for (const dateKey of dateKeys) {
    for (const series of recurring) {
      if (!isDateInRange(dateKey, series.startDate, series.endDate)) continue;

      const dateObj = parseIsoDate(dateKey);

      let matches = false;
      if (series.recurrence.kind === 'day_of_month') {
        matches = dateObj.getDate() === series.recurrence.day;
      } else if (series.recurrence.kind === 'day_of_week') {
        matches = dateObj.getDay() === series.recurrence.day;
      }

      if (!matches) continue;

      const instance: Event = {
        id: makeInstanceId(series.id, dateKey),
        seriesId: series.id,
        name: series.name,
        category: series.category,
        date: dateKey,
        startTime: series.startTime,
        endTime: series.endTime,
      };

      if (!out[dateKey]) out[dateKey] = [];
      out[dateKey].push(instance);
    }
  }

  // Sort each day by time/name
  for (const k of Object.keys(out)) {
    out[k] = sortEventsByTime(out[k]);
  }
  return out;
}

/**
 * Merges one-off events with expanded recurring instances.
 */
export function mergeEvents(oneOff: MonthEvents, expandedRecurring: MonthEvents): MonthEvents {
  const merged: MonthEvents = { ...oneOff };
  for (const dateKey of Object.keys(expandedRecurring)) {
    const combined = [...(merged[dateKey] || []), ...expandedRecurring[dateKey]];
    merged[dateKey] = sortEventsByTime(combined);
  }
  return merged;
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

// ============================================================================
// Time utilities for time-grid positioning
// ============================================================================

/**
 * Converts time string (HH:MM) to minutes since midnight.
 */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Formats hour number (0-23) to display format (e.g., "6 AM", "2 PM").
 */
export function formatHourDisplay(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

/**
 * Calculates CSS position for an event in the time grid.
 * Returns top and height as percentages.
 */
export function calculateEventPosition(
  startTime: string,
  endTime: string,
  dayStartHour = 6,
  dayEndHour = 22
) {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  const dayStartMinutes = dayStartHour * 60;
  const dayEndMinutes = dayEndHour * 60;
  const totalDayMinutes = dayEndMinutes - dayStartMinutes;

  const topPercent = Math.max(0, ((startMinutes - dayStartMinutes) / totalDayMinutes) * 100);
  const duration = endMinutes - startMinutes;
  const heightPercent = Math.max(2, (duration / totalDayMinutes) * 100); // Min 2% height

  return {
    top: `${topPercent}%`,
    height: `${heightPercent}%`,
  };
}

/**
 * Checks if two events overlap in time.
 */
export function eventsOverlap(event1: Event, event2: Event): boolean {
  if (!event1.startTime || !event1.endTime || !event2.startTime || !event2.endTime) {
    return false;
  }
  const start1 = parseTimeToMinutes(event1.startTime);
  const end1 = parseTimeToMinutes(event1.endTime);
  const start2 = parseTimeToMinutes(event2.startTime);
  const end2 = parseTimeToMinutes(event2.endTime);

  return start1 < end2 && start2 < end1;
}

/**
 * Groups overlapping events into separate columns.
 */
export function groupOverlappingEvents(events: Event[]): Event[][] {
  const groups: Event[][] = [];
  const timedEvents = events.filter(e => e.startTime && e.endTime);
  const sorted = [...timedEvents].sort((a, b) =>
    (a.startTime || '00:00').localeCompare(b.startTime || '00:00')
  );

  for (const event of sorted) {
    let placed = false;
    for (const group of groups) {
      if (!group.some(e => eventsOverlap(e, event))) {
        group.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) {
      groups.push([event]);
    }
  }

  return groups;
}

/**
 * Calculates width and left position for an event considering overlaps.
 */
export function calculateEventLayout(event: Event, allDayEvents: Event[]) {
  const overlapGroups = groupOverlappingEvents(allDayEvents);

  for (const group of overlapGroups) {
    const index = group.findIndex(e => e.id === event.id);
    if (index !== -1) {
      const count = Math.min(group.length, 3); // Max 3 side-by-side
      const width = 100 / count;
      const left = width * Math.min(index, count - 1);
      return { width: `${width}%`, left: `${left}%` };
    }
  }

  return { width: '100%', left: '0%' };
}
