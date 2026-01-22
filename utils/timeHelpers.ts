/**
 * Time utility functions for event time management
 */

/**
 * Parses a time string (HH:MM) into hour and minute components
 */
export const parseTime = (time: string): { hour: string; minute: string } => {
  if (!time) return { hour: '', minute: '00' };
  const [h, m] = time.split(':');
  return { hour: h, minute: m || '00' };
};

/**
 * Combines hour and minute into a time string (HH:MM)
 */
export const combineTime = (hour: string, minute: string): string => {
  if (!hour) return '';
  return `${hour}:${minute}`;
};

/**
 * Calculates end time (1 hour after start time)
 * Clamps to maximum 10 PM (22:00)
 */
export const calculateEndTime = (
  startHour: string,
  startMinute: string
): { hour: string; minute: string } => {
  if (!startHour) return { hour: '', minute: '00' };

  const startHourNum = parseInt(startHour, 10);
  const startMinuteNum = parseInt(startMinute, 10);

  // Add 1 hour
  let endHourNum = startHourNum + 1;
  const endMinuteNum = startMinuteNum;

  // Clamp to maximum 10 PM (22:00)
  if (endHourNum > 22) {
    endHourNum = 22;
  }

  return {
    hour: endHourNum.toString().padStart(2, '0'),
    minute: endMinuteNum.toString().padStart(2, '0'),
  };
};

/**
 * Validates that end time is after start time
 */
export const isEndTimeValid = (
  startHour: string,
  startMinute: string,
  endHour: string,
  endMinute: string
): boolean => {
  if (!startHour || !endHour) return true; // Don't validate if either is empty

  const startMinutes = parseInt(startHour, 10) * 60 + parseInt(startMinute, 10);
  const endMinutes = parseInt(endHour, 10) * 60 + parseInt(endMinute, 10);

  return endMinutes > startMinutes;
};
