import { Event, MonthEvents, RecurringEvent } from '@/types/event';
import { parseIsoDate, isDateInRange } from '@/services/calendar/dateUtils';

/**
 * Recurring event expansion and merging utilities
 */

/**
 * Creates a unique instance ID for a recurring event on a specific date
 */
function makeInstanceId(seriesId: string, date: string): string {
  return `${seriesId}__${date}`;
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
        const days = Array.isArray(series.recurrence.day)
          ? series.recurrence.day
          : [series.recurrence.day];
        matches = days.includes(dateObj.getDay());
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
 * Merges one-off events with expanded recurring instances
 */
export function mergeEvents(oneOff: MonthEvents, expandedRecurring: MonthEvents): MonthEvents {
  const merged: MonthEvents = { ...oneOff };
  for (const dateKey of Object.keys(expandedRecurring)) {
    const combined = [...(merged[dateKey] || []), ...expandedRecurring[dateKey]];
    merged[dateKey] = sortEventsByTime(combined);
  }
  return merged;
}
