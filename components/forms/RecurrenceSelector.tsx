import WeekDaySelector from './WeekDaySelector';

interface RecurrenceSelectorProps {
  repeatMode: 'none' | 'day_of_week' | 'day_of_month';
  onRepeatModeChange: (mode: 'none' | 'day_of_week' | 'day_of_month') => void;
  repeatDaysOfWeek: number[];
  onRepeatDaysOfWeekChange: (days: number[]) => void;
  repeatDayOfMonth: number;
  onRepeatDayOfMonthChange: (day: number) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
}

export default function RecurrenceSelector({
  repeatMode,
  onRepeatModeChange,
  repeatDaysOfWeek,
  onRepeatDaysOfWeekChange,
  repeatDayOfMonth,
  onRepeatDayOfMonthChange,
  endDate,
  onEndDateChange,
}: RecurrenceSelectorProps) {
  return (
    <div className="space-y-3 pt-2">
      <label className="block text-sm font-medium text-gray-700">Repeat</label>

      <select
        value={repeatMode}
        onChange={(e) =>
          onRepeatModeChange(e.target.value as typeof repeatMode)
        }
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      >
        <option value="none">Do not repeat</option>
        <option value="day_of_week">Every week (day of week)</option>
        <option value="day_of_month">Every month (day of month)</option>
      </select>

      {repeatMode === 'day_of_week' && (
        <WeekDaySelector
          selectedDays={repeatDaysOfWeek}
          onDaysChange={onRepeatDaysOfWeekChange}
        />
      )}

      {repeatMode === 'day_of_month' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Day of month (1-31)
          </label>
          <input
            type="number"
            min={1}
            max={31}
            value={repeatDayOfMonth}
            onChange={(e) =>
              onRepeatDayOfMonthChange(
                Math.max(1, Math.min(31, Number(e.target.value)))
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
      )}

      {repeatMode !== 'none' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End date (optional)
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );
}
