import { NextRequest, NextResponse } from 'next/server';
import { readEvents, writeEvents } from '@/lib/eventStorage';
import { Event, Category } from '@/types/event';

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
    const { name, category, date, time } = body;

    // Validate required fields
    if (!name || !category || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, date' },
        { status: 400 }
      );
    }

    // Create new event
    const newEvent: Event = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      category: category as Category,
      date,
      time,
    };

    // Read existing events
    const events = await readEvents();

    // Add event to the date
    if (!events[date]) {
      events[date] = [];
    }
    events[date].push(newEvent);

    // Write back to file
    await writeEvents(events);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
