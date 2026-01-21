import { NextRequest, NextResponse } from 'next/server';
import { readEvents, writeEvents } from '@/lib/eventStorage';
import { Category } from '@/types/event';

/**
 * PUT /api/events/[id] - Update an event
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, category, time } = body;

    // Read existing events
    const events = await readEvents();

    // Find and update the event
    let found = false;
    for (const date in events) {
      const eventIndex = events[date].findIndex((event) => event.id === id);
      if (eventIndex !== -1) {
        events[date][eventIndex] = {
          ...events[date][eventIndex],
          name,
          category: category as Category,
          time,
        };
        found = true;
        break;
      }
    }

    if (!found) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Write back to file
    await writeEvents(events);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[id] - Delete an event
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Read existing events
    const events = await readEvents();

    // Find and delete the event
    let found = false;
    for (const date in events) {
      const eventIndex = events[date].findIndex((event) => event.id === id);
      if (eventIndex !== -1) {
        events[date].splice(eventIndex, 1);
        // Remove the date key if no events left
        if (events[date].length === 0) {
          delete events[date];
        }
        found = true;
        break;
      }
    }

    if (!found) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Write back to file
    await writeEvents(events);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
