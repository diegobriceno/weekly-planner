export type Category =
  | 'work'
  | 'projects'
  | 'personal'
  | 'home'
  | 'benja'
  | 'sophi'
  | 'other';

export type RecurrenceRule =
  | {
      kind: 'day_of_month';
      /** 1-31 */
      day: number;
    }
  | {
      kind: 'day_of_week';
      /** JS getDay(): 0=Sun ... 6=Sat */
      day: number;
    };

export interface Event {
  id: string;
  name: string;
  category: Category;
  date: string; // ISO date format: YYYY-MM-DD
  time?: string; // Optional time in HH:MM format
  /** If present, this event is an instance of a recurring series. */
  seriesId?: string;
}

export type MonthEvents = {
  [key: string]: Event[]; // key is date string (YYYY-MM-DD)
};

export interface RecurringEvent {
  /** Stable ID of the series */
  id: string;
  name: string;
  category: Category;
  time?: string;
  /** Inclusive start date (YYYY-MM-DD). */
  startDate: string;
  /** Inclusive end date (YYYY-MM-DD). If omitted, no end limit. */
  endDate?: string;
  recurrence: RecurrenceRule;
}

export interface StoredEvents {
  byDate: MonthEvents;
  recurring: RecurringEvent[];
}
