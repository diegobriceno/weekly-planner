/**
 * Holiday service for identifying Peruvian holidays in 2026
 */

import { formatDate } from '@/services/calendar/dateUtils';

interface Holiday {
  date: string; // YYYY-MM-DD format
  name: string;
}

const holidays2026: Holiday[] = [
  { date: '2026-01-01', name: 'Año Nuevo' },
  { date: '2026-04-02', name: 'Semana Santa' },
  { date: '2026-04-03', name: 'Semana Santa' },
  { date: '2026-05-01', name: 'Día del Trabajo' },
  { date: '2026-06-07', name: 'Batalla de Arica y Día de la Bandera' },
  { date: '2026-06-29', name: 'Día de San Pedro y San Pablo' },
  { date: '2026-07-23', name: 'Día de la Fuerza Aérea del Perú' },
  { date: '2026-07-28', name: 'Fiestas Patrias' },
  { date: '2026-07-29', name: 'Fiestas Patrias' },
  { date: '2026-08-06', name: 'Batalla de Junín' },
  { date: '2026-08-30', name: 'Santa Rosa de Lima' },
  { date: '2026-10-08', name: 'Combate de Angamos' },
  { date: '2026-11-01', name: 'Día de Todos los Santos' },
  { date: '2026-12-08', name: 'Inmaculada Concepción' },
  { date: '2026-12-09', name: 'Batalla de Ayacucho' },
  { date: '2026-12-25', name: 'Navidad' },
];

const holidayMap = new Map<string, string>(
  holidays2026.map(h => [h.date, h.name])
);

/**
 * Checks if a given date is a holiday
 */
export function isHoliday(date: Date | string): boolean {
  const dateKey = typeof date === 'string' ? date : formatDate(date);
  return holidayMap.has(dateKey);
}

/**
 * Gets the holiday name for a given date, or null if not a holiday
 */
export function getHolidayName(date: Date | string): string | null {
  const dateKey = typeof date === 'string' ? date : formatDate(date);
  return holidayMap.get(dateKey) || null;
}
