import { NextRequest, NextResponse } from 'next/server';
import { readEvents, writeEvents } from '@/lib/eventStorage';
import { Category, Event, RecurrenceRule, RecurringEvent } from '@/types/event';

/**
 * GET /api/events - Get all events
 */
export async function GET() {
  try {
    const events = await readEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error reading events:', error);
    return NextResponse.json(
      { error: 'Failed to read events' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events - Create a new event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, date, startTime, endTime, recurrence, endDate } = body as {
      name?: string;
      category?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      recurrence?: RecurrenceRule;
      endDate?: string;
    };

    // Validate required fields
    if (!name || !category || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, date' },
        { status: 400 }
      );
    }

    // Read existing events
    const stored = await readEvents();

    // Recurring series
    if (recurrence) {
      const newRecurring: RecurringEvent = {
        id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        category: category as Category,
        startTime,
        endTime,
        startDate: date,
        endDate,
        recurrence,
      };
      stored.recurring.push(newRecurring);
      await writeEvents(stored);
      return NextResponse.json(newRecurring, { status: 201 });
    }

    // One-off event
    const newEvent: Event = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      category: category as Category,
      date,
      startTime,
      endTime,
    };

    if (!stored.byDate[date]) {
      stored.byDate[date] = [];
    }
    stored.byDate[date].push(newEvent);
    await writeEvents(stored);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
