/**
 * Date utility functions for formatting, parsing, and comparing dates
 */

/**
 * Formats a Date object to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses an ISO date string (YYYY-MM-DD) to a Date object
 */
export function parseIsoDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Compares two ISO date strings (YYYY-MM-DD)
 * Returns -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Checks if a date is within a range (inclusive)
 */
export function isDateInRange(date: string, start: string, end?: string): boolean {
  if (compareIso(date, start) < 0) return false;
  if (end && compareIso(date, end) > 0) return false;
  return true;
}

/**
 * Checks if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Checks if a date belongs to the current month
 */
export function isCurrentMonth(date: Date, currentMonth: number): boolean {
  return date.getMonth() === currentMonth;
}

/**
 * Gets the localized month name
 */
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

/**
 * Gets the abbreviated weekday names starting from Monday
 */
export function getWeekDayNames(): string[] {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}
