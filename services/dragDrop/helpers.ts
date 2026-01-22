import { Event } from '@/types/event';
import {
  calculateEventDuration,
  calculateNewEndTime,
  validateTimeWithinBounds,
  calculateTimeFromPosition
} from '@/services/calendar/timeUtils';

/**
 * Drag and drop helper functions for event management
 */

// Re-export time utilities for convenience
export {
  calculateEventDuration,
  calculateNewEndTime,
  validateTimeWithinBounds,
  calculateTimeFromPosition
};

/**
 * Check if an event can be dragged
 * Events with seriesId (recurring events) cannot be dragged
 */
export function isEventDraggable(event: Event): boolean {
  return !event.seriesId;
}
