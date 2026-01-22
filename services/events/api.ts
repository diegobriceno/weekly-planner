import { Category, Event, RecurrenceRule, RecurringEvent, StoredEvents } from '@/types/event';

// Centraliza fetch + manejo de errores HTTP simples
async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${body || response.statusText}`);
  }
  return response.json();
}

export async function fetchAllEvents(): Promise<StoredEvents> {
  return requestJson<StoredEvents>('/api/events');
}

export async function createEventApi(input: {
  name: string;
  category: Category;
  date: string;
  startTime?: string;
  endTime?: string;
  recurrence?: RecurrenceRule;
  endDate?: string;
}): Promise<Event | RecurringEvent> {
  return requestJson<Event | RecurringEvent>('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function updateEventApi(
  eventId: string,
  updates: {
    name?: string;
    category?: Category;
    date?: string;
    startTime?: string;
    endTime?: string;
    recurrence?: RecurrenceRule;
    endDate?: string;
  }
): Promise<void> {
  await requestJson(`/api/events/${eventId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

export async function deleteEventApi(eventId: string): Promise<void> {
  await requestJson(`/api/events/${eventId}`, { method: 'DELETE' });
}
