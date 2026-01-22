import { Event } from '@/types/event';

/**
 * Calculate the duration of an event in minutes
 */
export function calculateEventDuration(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return endMinutes - startMinutes;
}

/**
 * Validate that the event end time does not exceed 10 PM (22:00)
 */
export function validateTimeWithinBounds(startTime: string, durationMinutes: number): boolean {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = startMinutes + durationMinutes;

  const maxMinutes = 22 * 60; // 10 PM

  return endMinutes <= maxMinutes;
}

/**
 * Calculate new end time from start time and duration in minutes
 */
export function calculateNewEndTime(newStartTime: string, durationMinutes: number): string {
  const [startHour, startMinute] = newStartTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = startMinutes + durationMinutes;

  const endHour = Math.floor(endMinutes / 60);
  const endMinute = endMinutes % 60;

  return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}

/**
 * Calculate time (hour and minute) from Y position in weekly grid
 * More precise than calculateClickedHour as it includes minutes
 */
export function calculateTimeFromPosition(
  clickY: number,
  containerHeight: number,
  dayStartHour: number = 6
): { hour: number; minute: number } {
  const totalHours = 16; // 6 AM to 10 PM
  const percentage = clickY / containerHeight;
  const totalMinutes = percentage * totalHours * 60;

  const hour = Math.floor(totalMinutes / 60) + dayStartHour;
  const minute = Math.floor(totalMinutes % 60);

  // Round to nearest 15 minutes for cleaner times
  const roundedMinute = Math.round(minute / 15) * 15;

  return {
    hour: roundedMinute === 60 ? hour + 1 : hour,
    minute: roundedMinute === 60 ? 0 : roundedMinute
  };
}

/**
 * Check if an event can be dragged
 * Events with seriesId (recurring events) cannot be dragged
 */
export function isEventDraggable(event: Event): boolean {
  return !event.seriesId;
}
