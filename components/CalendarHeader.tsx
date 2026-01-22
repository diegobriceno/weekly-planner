import Breadcrumb from './Breadcrumb';
import CategoryFilter from './CategoryFilter';
import { Category } from '@/types/event';

interface CalendarHeaderProps {
  currentMonth: number;
  currentYear: number;
  monthName: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onAddEvent: () => void;
  viewMode: 'month' | 'week';
  onViewModeChange: (mode: 'month' | 'week') => void;
  disabledCategories: Category[];
  onCategoryToggle: (category: Category | 'all') => void;
}

export default function CalendarHeader({
  currentMonth,
  currentYear,
  monthName,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onAddEvent,
  viewMode,
  onViewModeChange,
  disabledCategories,
  onCategoryToggle,
}: CalendarHeaderProps) {
  const startDate = new Date(currentYear, currentMonth, 1);
  const endDate = new Date(currentYear, currentMonth + 1, 0);

  return (
    <div className="mb-6">
      <Breadcrumb />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            {monthName} {currentYear}
          </h1>
          <p className="text-sm text-gray-500">
            {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => onViewModeChange('month')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                viewMode === 'month'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Month view
            </button>
            <button
              onClick={() => onViewModeChange('week')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors border-l border-gray-200 ${
                viewMode === 'week'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Week view
            </button>
          </div>

          <div className="flex items-center bg-white border border-gray-200 rounded-lg">
            <button
              onClick={onPreviousMonth}
              className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors"
              aria-label="Previous month"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={onToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-x border-gray-200"
            >
              Today
            </button>

            <button
              onClick={onNextMonth}
              className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors"
              aria-label="Next month"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={onAddEvent}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add event
          </button>
        </div>
      </div>

      <CategoryFilter
        disabledCategories={disabledCategories}
        onCategoryToggle={onCategoryToggle}
      />
    </div>
  );
}
