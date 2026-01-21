import fs from 'fs/promises';
import path from 'path';
import { MonthEvents, StoredEvents } from '@/types/event';

const DATA_FILE = path.join(process.cwd(), 'data', 'events.json');

/**
 * Reads events from the JSON file
 */
export async function readEvents(): Promise<StoredEvents> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data) as unknown;

    // Backwards compatibility: previous format was MonthEvents (top-level map of date -> events[])
    if (isMonthEvents(parsed)) {
      return { byDate: parsed, recurring: [] };
    }

    if (isStoredEvents(parsed)) {
      return parsed;
    }

    // Unknown shape -> reset to empty
    return { byDate: {}, recurring: [] };
  } catch {
    // If file doesn't exist or is empty, return empty object
    return { byDate: {}, recurring: [] };
  }
}

/**
 * Writes events to the JSON file
 */
export async function writeEvents(events: StoredEvents): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2), 'utf-8');
}

function isMonthEvents(value: unknown): value is MonthEvents {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  // MonthEvents are objects whose values are arrays (of events) keyed by date-like strings.
  // We allow empty object too.
  return Object.keys(v).every((k) => Array.isArray(v[k]));
}

function isStoredEvents(value: unknown): value is StoredEvents {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (!('byDate' in v) || !('recurring' in v)) return false;
  return isMonthEvents(v.byDate) && Array.isArray(v.recurring);
}
