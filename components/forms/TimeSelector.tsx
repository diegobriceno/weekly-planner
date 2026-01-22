import { minuteOptions } from '@/constants/eventConstants';

interface TimeSelectorProps {
  label: string;
  hour: string;
  minute: string;
  onHourChange: (hour: string) => void;
  onMinuteChange: (minute: string) => void;
  hourOptions: { value: string; label: string }[];
  required?: boolean;
  hasError?: boolean;
}

export default function TimeSelector({
  label,
  hour,
  minute,
  onHourChange,
  onMinuteChange,
  hourOptions,
  required = false,
  hasError = false,
}: TimeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={hour}
          onChange={(e) => onHourChange(e.target.value)}
          required={required}
          className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent ${
            hasError
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-gray-900'
          }`}
        >
          <option value="">Hour</option>
          {hourOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={minute}
          onChange={(e) => onMinuteChange(e.target.value)}
          disabled={!hour}
          className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 ${
            hasError && hour
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-gray-900'
          }`}
        >
          {minuteOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
