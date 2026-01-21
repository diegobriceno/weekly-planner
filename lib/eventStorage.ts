import fs from 'fs/promises';
import path from 'path';
import { MonthEvents } from '@/types/event';

const DATA_FILE = path.join(process.cwd(), 'data', 'events.json');

/**
 * Reads events from the JSON file
 */
export async function readEvents(): Promise<MonthEvents> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // If file doesn't exist or is empty, return empty object
    return {};
  }
}

/**
 * Writes events to the JSON file
 */
export async function writeEvents(events: MonthEvents): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2), 'utf-8');
}
