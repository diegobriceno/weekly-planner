export type Category =
  | 'work'
  | 'projects'
  | 'personal'
  | 'home'
  | 'finances'
  | 'other';

export type RecurrenceRule =
  | {
      kind: 'day_of_month';
      /** 1-31 */
      day: number;
    }
  | {
      kind: 'day_of_week';
      /** JS getDay(): 0=Sun ... 6=Sat. Can be a single number or array of numbers */
      day: number | number[];
    };

export interface Event {
  id: string;
  name: string;
  category: Category;
  date: string; // ISO date format: YYYY-MM-DD
  startTime?: string; // Optional start time in HH:MM format
  endTime?: string; // Optional end time in HH:MM format
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
  startTime?: string; // Optional start time in HH:MM format
  endTime?: string; // Optional end time in HH:MM format
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
