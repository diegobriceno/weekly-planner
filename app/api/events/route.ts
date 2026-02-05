import { NextRequest, NextResponse } from 'next/server';
import { readEvents, createEvent, createRecurringEvent } from '@/lib/eventStorage';
import { Category, RecurrenceRule } from '@/types/event';

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

    // Recurring series
    if (recurrence) {
      const newRecurring = await createRecurringEvent({
        name,
        category: category as Category,
        startTime,
        endTime,
        startDate: date,
        endDate,
        recurrence,
      });
      return NextResponse.json(newRecurring, { status: 201 });
    }

    // One-off event
    const newEvent = await createEvent({
      name,
      category: category as Category,
      date,
      startTime,
      endTime,
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
