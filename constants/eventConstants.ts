import { Category } from '@/types/event';

/**
 * Event-related constants
 */

export const categories: Category[] = [
  'work',
  'projects',
  'personal',
  'home',
  'finances',
  'other',
];

export const weekDayOptions: { label: string; value: number }[] = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

// Generate hour options for start time (6am to 9pm - cannot start at 10pm)
export const startHourOptions = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 6; // 6 to 21
  const display =
    hour === 0
      ? '12 AM'
      : hour < 12
        ? `${hour} AM`
        : hour === 12
          ? '12 PM'
          : `${hour - 12} PM`;
  return { value: hour.toString().padStart(2, '0'), label: display };
});

// Generate hour options for end time (6am to 10pm)
export const endHourOptions = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6; // 6 to 22
  const display =
    hour === 0
      ? '12 AM'
      : hour < 12
        ? `${hour} AM`
        : hour === 12
          ? '12 PM'
          : `${hour - 12} PM`;
  return { value: hour.toString().padStart(2, '0'), label: display };
});

// Minute options: 00, 15, 30, 45
export const minuteOptions = [
  { value: '00', label: '00' },
  { value: '15', label: '15' },
  { value: '30', label: '30' },
  { value: '45', label: '45' },
];
