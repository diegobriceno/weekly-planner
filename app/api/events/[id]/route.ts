import { NextRequest, NextResponse } from 'next/server';
import { readEvents, writeEvents } from '@/lib/eventStorage';
import { Category, RecurrenceRule } from '@/types/event';

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
    const { name, category, time, recurrence, endDate } = body as {
      name?: string;
      category?: string;
      time?: string;
      recurrence?: RecurrenceRule;
      endDate?: string;
    };

    // Read existing events
    const events = await readEvents();

    // Update recurring series if it exists
    const recurringIndex = events.recurring.findIndex((r) => r.id === id);
    if (recurringIndex !== -1) {
      events.recurring[recurringIndex] = {
        ...events.recurring[recurringIndex],
        ...(name !== undefined ? { name } : {}),
        ...(category !== undefined ? { category: category as Category } : {}),
        ...(time !== undefined ? { time } : {}),
        ...(recurrence !== undefined ? { recurrence } : {}),
        ...(endDate !== undefined ? { endDate } : {}),
      };
      await writeEvents(events);
      return NextResponse.json({ success: true });
    }

    // Find and update the event
    let found = false;
    for (const date in events.byDate) {
      const eventIndex = events.byDate[date].findIndex((event) => event.id === id);
      if (eventIndex !== -1) {
        events.byDate[date][eventIndex] = {
          ...events.byDate[date][eventIndex],
          ...(name !== undefined ? { name } : {}),
          ...(category !== undefined ? { category: category as Category } : {}),
          ...(time !== undefined ? { time } : {}),
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

    // Delete recurring series if it exists
    const before = events.recurring.length;
    events.recurring = events.recurring.filter((r) => r.id !== id);
    if (events.recurring.length !== before) {
      await writeEvents(events);
      return NextResponse.json({ success: true });
    }

    // Find and delete the event
    let found = false;
    for (const date in events.byDate) {
      const eventIndex = events.byDate[date].findIndex((event) => event.id === id);
      if (eventIndex !== -1) {
        events.byDate[date].splice(eventIndex, 1);
        // Remove the date key if no events left
        if (events.byDate[date].length === 0) {
          delete events.byDate[date];
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
