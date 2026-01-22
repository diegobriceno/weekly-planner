/**
 * Time utility functions for parsing, formatting, and calculating times
 */

/**
 * Converts time string (HH:MM) to minutes since midnight
 */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Formats hour number (0-23) to display format (e.g., "6 AM", "2 PM")
 */
export function formatHourDisplay(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

/**
 * Calculate the duration of an event in minutes
 */
export function calculateEventDuration(startTime: string, endTime: string): number {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  return endMinutes - startMinutes;
}

/**
 * Calculate new end time from start time and duration in minutes
 */
export function calculateNewEndTime(newStartTime: string, durationMinutes: number): string {
  const startMinutes = parseTimeToMinutes(newStartTime);
  const endMinutes = startMinutes + durationMinutes;

  const endHour = Math.floor(endMinutes / 60);
  const endMinute = endMinutes % 60;

  return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}

/**
 * Validate that the event end time does not exceed 10 PM (22:00)
 */
export function validateTimeWithinBounds(startTime: string, durationMinutes: number): boolean {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  const maxMinutes = 22 * 60; // 10 PM

  return endMinutes <= maxMinutes;
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
 * Calculates CSS position for an event in the time grid
 * Returns top and height as percentages
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
