import { Calendar, CalendarRange } from 'lucide-react';

interface ViewModeToggleProps {
  viewMode: 'month' | 'week';
  onViewModeChange: (mode: 'month' | 'week') => void;
}

export default function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) {
  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-lg">
      <button
        onClick={() => onViewModeChange('month')}
        className={`p-2 rounded-l-lg transition-colors ${
          viewMode === 'month'
            ? 'bg-gray-900 text-white'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
        aria-label="Month view"
      >
        <Calendar className="w-5 h-5" />
      </button>
      <button
        onClick={() => onViewModeChange('week')}
        className={`p-2 rounded-r-lg transition-colors border-l border-gray-200 ${
          viewMode === 'week'
            ? 'bg-gray-900 text-white'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
        aria-label="Week view"
      >
        <CalendarRange className="w-5 h-5" />
      </button>
    </div>
  );
}
