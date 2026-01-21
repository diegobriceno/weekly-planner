export type Category =
  | 'work'
  | 'projects'
  | 'personal'
  | 'home'
  | 'benja'
  | 'sophi'
  | 'other';

export interface Event {
  id: string;
  name: string;
  category: Category;
  date: string; // ISO date format: YYYY-MM-DD
  time?: string; // Optional time in HH:MM format
}

export type MonthEvents = {
  [key: string]: Event[]; // key is date string (YYYY-MM-DD)
};
