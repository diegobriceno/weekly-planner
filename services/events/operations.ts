import { Event, Category, MonthEvents } from '@/types/event';

/**
 * Event CRUD operations for managing events in MonthEvents structure
 */

/**
 * Generates a unique event ID
 */
function generateEventId(): string {
  return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sorts events by start time, then by name
 */
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
 * Creates a new event object
 */
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

/**
 * Adds an event to the MonthEvents structure
 */
export function addEventToMonth(monthEvents: MonthEvents, event: Event): MonthEvents {
  const dateEvents = monthEvents[event.date] || [];
  return {
    ...monthEvents,
    [event.date]: sortEventsByTime([...dateEvents, event]),
  };
}

/**
 * Updates an event in the MonthEvents structure
 */
export function updateEventInMonth(
  monthEvents: MonthEvents,
  eventId: string,
  updates: { name: string; category: Category; startTime?: string; endTime?: string }
): MonthEvents {
  const updatedMonth: MonthEvents = {};

  Object.keys(monthEvents).forEach((date) => {
    const updatedEvents = monthEvents[date].map((event) =>
      event.id === eventId
        ? { ...event, name: updates.name, category: updates.category, startTime: updates.startTime, endTime: updates.endTime }
        : event
    );
    updatedMonth[date] = sortEventsByTime(updatedEvents);
  });

  return updatedMonth;
}

/**
 * Deletes an event from the MonthEvents structure
 */
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

/**
 * Moves an event from one date to another, optionally updating start and end times
 */
export function moveEventToNewDate(
  monthEvents: MonthEvents,
  eventId: string,
  newDate: string,
  newStartTime?: string,
  newEndTime?: string
): MonthEvents {
  const updatedMonth: MonthEvents = {};
  let movedEvent: Event | null = null;

  // Find and remove event from old date
  Object.keys(monthEvents).forEach((date) => {
    const filteredEvents = monthEvents[date].filter((event) => {
      if (event.id === eventId) {
        movedEvent = event;
        return false; // Remove from old date
      }
      return true;
    });

    if (filteredEvents.length > 0) {
      updatedMonth[date] = filteredEvents;
    }
  });

  // If event was found, add to new date with updates
  if (movedEvent) {
    const eventToMove: Event = movedEvent;
    const updatedEvent: Event = {
      ...eventToMove,
      date: newDate,
      ...(newStartTime !== undefined ? { startTime: newStartTime } : {}),
      ...(newEndTime !== undefined ? { endTime: newEndTime } : {}),
    };

    const newDateEvents = updatedMonth[newDate] || [];
    updatedMonth[newDate] = sortEventsByTime([...newDateEvents, updatedEvent]);
  }

  return updatedMonth;
}

/**
 * Gets all events for a specific date
 */
export function getEventsForDate(monthEvents: MonthEvents, date: string): Event[] {
  return monthEvents[date] || [];
}
