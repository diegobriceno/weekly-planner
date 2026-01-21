import { Task, Category, MonthTasks } from '@/types/task';

/**
 * Task Service - Encapsulates business logic for task management
 */

/**
 * Creates a new task
 */
export function createTask(
  name: string,
  category: Category,
  date: string,
  time?: string
): Task {
  return {
    id: generateTaskId(),
    name,
    category,
    date,
    time,
  };
}

/**
 * Adds a task to the month tasks collection
 */
export function addTaskToMonth(
  monthTasks: MonthTasks,
  task: Task
): MonthTasks {
  const dateTasks = monthTasks[task.date] || [];
  return {
    ...monthTasks,
    [task.date]: [...dateTasks, task],
  };
}

/**
 * Updates a task in the month tasks collection
 */
export function updateTaskInMonth(
  monthTasks: MonthTasks,
  taskId: string,
  updates: { name: string; category: Category; time?: string }
): MonthTasks {
  const updatedMonth: MonthTasks = {};

  Object.keys(monthTasks).forEach((date) => {
    updatedMonth[date] = monthTasks[date].map((task) =>
      task.id === taskId
        ? { ...task, name: updates.name, category: updates.category, time: updates.time }
        : task
    );
  });

  return updatedMonth;
}

/**
 * Deletes a task from the month tasks collection
 */
export function deleteTaskFromMonth(
  monthTasks: MonthTasks,
  taskId: string
): MonthTasks {
  const updatedMonth: MonthTasks = {};

  Object.keys(monthTasks).forEach((date) => {
    const filteredTasks = monthTasks[date].filter((task) => task.id !== taskId);
    if (filteredTasks.length > 0) {
      updatedMonth[date] = filteredTasks;
    }
  });

  return updatedMonth;
}

/**
 * Gets tasks for a specific date
 */
export function getTasksForDate(
  monthTasks: MonthTasks,
  date: string
): Task[] {
  return monthTasks[date] || [];
}

/**
 * Generates a unique task ID
 */
function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Gets the days in a month as an array of Date objects
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
 * Formats a date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets month name from month number
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
 * Gets short day names for the week header
 */
export function getWeekDayNames(): string[] {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
 * Checks if a date is in the current month
 */
export function isCurrentMonth(date: Date, currentMonth: number): boolean {
  return date.getMonth() === currentMonth;
}

/**
 * Gets the days in a specific week (Monday to Sunday)
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
 * Gets the current week days
 */
export function getCurrentWeekDays(): Date[] {
  const today = new Date();
  return getWeekDays(today.getFullYear(), today.getMonth(), today);
}
