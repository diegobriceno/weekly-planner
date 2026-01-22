/**
 * Calendar utility functions for generating month and week views
 */

/**
 * Gets all days to display in a month view (including padding days)
 * Returns a 6x7 grid (42 days) with padding from previous/next months
 */
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

/**
 * Gets the 7 days of a week starting from Monday
 */
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

/**
 * Gets the current week's days (Monday to Sunday)
 */
export function getCurrentWeekDays(): Date[] {
  const today = new Date();
  return getWeekDays(today.getFullYear(), today.getMonth(), today);
}
