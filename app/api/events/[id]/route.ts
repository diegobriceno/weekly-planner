import { NextRequest, NextResponse } from 'next/server';
import {
  readEvents,
  updateEvent,
  deleteEvent,
  updateRecurringEvent,
  deleteRecurringEvent
} from '@/lib/eventStorage';
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
    const { name, category, date, startTime, endTime, completed, recurrence, endDate } = body as {
      name?: string;
      category?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      completed?: boolean;
      recurrence?: RecurrenceRule;
      endDate?: string;
    };

    // Check if this is a recurring event
    const events = await readEvents();
    const isRecurring = events.recurring.some((r) => r.id === id);

    if (isRecurring) {
      // Update recurring series
      const updates: Parameters<typeof updateRecurringEvent>[1] = {};
      if (name !== undefined) updates.name = name;
      if (category !== undefined) updates.category = category as Category;
      if (startTime !== undefined) updates.startTime = startTime;
      if (endTime !== undefined) updates.endTime = endTime;
      if (recurrence !== undefined) updates.recurrence = recurrence;
      if (endDate !== undefined) updates.endDate = endDate;

      await updateRecurringEvent(id, updates);
      return NextResponse.json({ success: true });
    }

    // Update one-off event
    const isOneOff = Object.values(events.byDate).some(dateEvents =>
      dateEvents.some(e => e.id === id)
    );

    if (isOneOff) {
      const updates: Parameters<typeof updateEvent>[1] = {};
      if (name !== undefined) updates.name = name;
      if (category !== undefined) updates.category = category as Category;
      if (date !== undefined) updates.date = date;
      if (startTime !== undefined) updates.startTime = startTime;
      if (endTime !== undefined) updates.endTime = endTime;
      if (completed !== undefined) updates.completed = completed;

      await updateEvent(id, updates);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    );
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

    // Check if this is a recurring event
    const events = await readEvents();
    const isRecurring = events.recurring.some((r) => r.id === id);

    if (isRecurring) {
      await deleteRecurringEvent(id);
      return NextResponse.json({ success: true });
    }

    // Check if this is a one-off event
    const isOneOff = Object.values(events.byDate).some(dateEvents =>
      dateEvents.some(e => e.id === id)
    );

    if (isOneOff) {
      await deleteEvent(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
