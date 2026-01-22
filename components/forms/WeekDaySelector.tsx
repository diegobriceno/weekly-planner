import { weekDayOptions } from '@/constants/eventConstants';

interface WeekDaySelectorProps {
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
}

export default function WeekDaySelector({
  selectedDays,
  onDaysChange,
}: WeekDaySelectorProps) {
  const handleDayToggle = (dayValue: number, checked: boolean) => {
    if (checked) {
      onDaysChange([...selectedDays, dayValue].sort());
    } else {
      onDaysChange(selectedDays.filter((day) => day !== dayValue));
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Days of week (select one or more)
      </label>
      <div className="grid grid-cols-2 gap-2">
        {weekDayOptions.map((d) => (
          <label
            key={d.value}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedDays.includes(d.value)}
              onChange={(e) => handleDayToggle(d.value, e.target.checked)}
              className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
            />
            <span className="text-sm text-gray-900">{d.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
