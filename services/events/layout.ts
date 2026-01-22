import { Event } from '@/types/event';
import { parseTimeToMinutes } from '@/services/calendar/timeUtils';

/**
 * Event layout utilities for handling overlapping events and positioning
 */

/**
 * Checks if two events overlap in time
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
 * Gets all events that overlap with the given event
 */
function getOverlappingEvents(event: Event, allEvents: Event[]): Event[] {
  return allEvents.filter(e =>
    e.id !== event.id && eventsOverlap(event, e)
  );
}

/**
 * Calculates width and left position for an event considering overlaps
 * Uses a column-based layout algorithm for overlapping events
 */
export function calculateEventLayout(event: Event, allDayEvents: Event[]) {
  // Get all events that overlap with this event
  const overlapping = getOverlappingEvents(event, allDayEvents);

  if (overlapping.length === 0) {
    return { width: '100%', left: '0%' };
  }

  // Sort all overlapping events (including current) by start time, then by id for stability
  const allOverlapping = [event, ...overlapping].sort((a, b) => {
    const timeCompare = (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
    if (timeCompare !== 0) return timeCompare;
    return a.id.localeCompare(b.id);
  });

  // Find the column index for the current event
  const columnIndex = allOverlapping.findIndex(e => e.id === event.id);

  // Calculate total columns needed (max 3 to keep events readable)
  const totalColumns = Math.min(allOverlapping.length, 3);

  // Calculate width and position
  const width = 100 / totalColumns;
  const left = width * Math.min(columnIndex, totalColumns - 1);

  return {
    width: `${width}%`,
    left: `${left}%`
  };
}
