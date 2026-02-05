import { createClient } from '@/lib/supabase/server';
import { Event, RecurringEvent, StoredEvents, MonthEvents, Category, RecurrenceRule } from '@/types/event';

/**
 * Database row types (matches Supabase schema)
 */
interface EventRow {
  id: string;
  name: string;
  category: Category;
  date: string;
  start_time: string | null;
  end_time: string | null;
  completed: boolean | null;
  created_at: string;
  updated_at: string;
}

interface RecurringEventRow {
  id: string;
  name: string;
  category: Category;
  start_time: string | null;
  end_time: string | null;
  start_date: string;
  end_date: string | null;
  recurrence_kind: 'day_of_month' | 'day_of_week';
  recurrence_day: number[] | null;
  created_at: string;
  updated_at: string;
}

/**
 * Reads all events from Supabase
 */
export async function readEvents(): Promise<StoredEvents> {
  const supabase = await createClient();

  // Fetch one-off events
  const { data: eventsData, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (eventsError) {
    console.error('Error reading events:', eventsError);
    return { byDate: {}, recurring: [] };
  }

  // Fetch recurring events
  const { data: recurringData, error: recurringError } = await supabase
    .from('recurring_events')
    .select('*')
    .order('start_date', { ascending: true });

  if (recurringError) {
    console.error('Error reading recurring events:', recurringError);
    return { byDate: {}, recurring: [] };
  }

  // Transform events to MonthEvents format (grouped by date)
  const byDate: MonthEvents = {};
  (eventsData || []).forEach((row: EventRow) => {
    const event: Event = {
      id: row.id,
      name: row.name,
      category: row.category,
      date: row.date,
      ...(row.start_time ? { startTime: row.start_time } : {}),
      ...(row.end_time ? { endTime: row.end_time } : {}),
      ...(row.completed ? { completed: row.completed } : {}),
    };

    if (!byDate[row.date]) {
      byDate[row.date] = [];
    }
    byDate[row.date].push(event);
  });

  // Transform recurring events
  const recurring: RecurringEvent[] = (recurringData || []).map((row: RecurringEventRow) => {
    const recurrence: RecurrenceRule =
      row.recurrence_kind === 'day_of_month'
        ? { kind: 'day_of_month', day: row.recurrence_day?.[0] || 1 }
        : {
            kind: 'day_of_week',
            day: row.recurrence_day && row.recurrence_day.length === 1
              ? row.recurrence_day[0]
              : row.recurrence_day || []
          };

    return {
      id: row.id,
      name: row.name,
      category: row.category,
      ...(row.start_time ? { startTime: row.start_time } : {}),
      ...(row.end_time ? { endTime: row.end_time } : {}),
      startDate: row.start_date,
      ...(row.end_date ? { endDate: row.end_date } : {}),
      recurrence,
    };
  });

  return { byDate, recurring };
}

/**
 * Creates a new one-off event
 */
export async function createEvent(event: Omit<Event, 'id'>): Promise<Event> {
  const supabase = await createClient();

  const newEvent = {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: event.name,
    category: event.category,
    date: event.date,
    start_time: event.startTime || null,
    end_time: event.endTime || null,
    completed: event.completed || false,
  };

  const { data, error } = await supabase
    .from('events')
    .insert(newEvent)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    date: data.date,
    ...(data.start_time ? { startTime: data.start_time } : {}),
    ...(data.end_time ? { endTime: data.end_time } : {}),
    ...(data.completed ? { completed: data.completed } : {}),
  };
}

/**
 * Updates an existing one-off event
 */
export async function updateEvent(id: string, updates: Partial<Omit<Event, 'id'>>): Promise<void> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.date !== undefined) updateData.date = updates.date;
  if (updates.startTime !== undefined) updateData.start_time = updates.startTime;
  if (updates.endTime !== undefined) updateData.end_time = updates.endTime;
  if (updates.completed !== undefined) updateData.completed = updates.completed;

  const { error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update event: ${error.message}`);
  }
}

/**
 * Deletes a one-off event
 */
export async function deleteEvent(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`);
  }
}

/**
 * Creates a new recurring event
 */
export async function createRecurringEvent(event: Omit<RecurringEvent, 'id'>): Promise<RecurringEvent> {
  const supabase = await createClient();

  // Transform recurrence rule to database format
  const recurrenceDays =
    event.recurrence.kind === 'day_of_month'
      ? [event.recurrence.day]
      : Array.isArray(event.recurrence.day)
        ? event.recurrence.day
        : [event.recurrence.day];

  const newRecurring = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: event.name,
    category: event.category,
    start_time: event.startTime || null,
    end_time: event.endTime || null,
    start_date: event.startDate,
    end_date: event.endDate || null,
    recurrence_kind: event.recurrence.kind,
    recurrence_day: recurrenceDays,
  };

  const { data, error } = await supabase
    .from('recurring_events')
    .insert(newRecurring)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create recurring event: ${error.message}`);
  }

  const recurrence: RecurrenceRule =
    data.recurrence_kind === 'day_of_month'
      ? { kind: 'day_of_month', day: data.recurrence_day[0] }
      : {
          kind: 'day_of_week',
          day: data.recurrence_day.length === 1 ? data.recurrence_day[0] : data.recurrence_day
        };

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    ...(data.start_time ? { startTime: data.start_time } : {}),
    ...(data.end_time ? { endTime: data.end_time } : {}),
    startDate: data.start_date,
    ...(data.end_date ? { endDate: data.end_date } : {}),
    recurrence,
  };
}

/**
 * Updates an existing recurring event
 */
export async function updateRecurringEvent(id: string, updates: Partial<Omit<RecurringEvent, 'id'>>): Promise<void> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.startTime !== undefined) updateData.start_time = updates.startTime;
  if (updates.endTime !== undefined) updateData.end_time = updates.endTime;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
  if (updates.endDate !== undefined) updateData.end_date = updates.endDate;

  if (updates.recurrence !== undefined) {
    updateData.recurrence_kind = updates.recurrence.kind;
    updateData.recurrence_day =
      updates.recurrence.kind === 'day_of_month'
        ? [updates.recurrence.day]
        : Array.isArray(updates.recurrence.day)
          ? updates.recurrence.day
          : [updates.recurrence.day];
  }

  const { error } = await supabase
    .from('recurring_events')
    .update(updateData)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update recurring event: ${error.message}`);
  }
}

/**
 * Deletes a recurring event
 */
export async function deleteRecurringEvent(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('recurring_events')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete recurring event: ${error.message}`);
  }
}

/**
 * @deprecated Use individual CRUD functions instead
 * This function is kept for backwards compatibility but does nothing
 */
export async function writeEvents(_events: StoredEvents): Promise<void> {
  console.warn('writeEvents() is deprecated. Use individual CRUD functions instead.');
}
