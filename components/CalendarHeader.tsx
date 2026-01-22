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

      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {monthName} {currentYear}
        </h1>
        <p className="text-sm text-gray-500">
          {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <CategoryFilter
        disabledCategories={disabledCategories}
        onCategoryToggle={onCategoryToggle}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
        onToday={onToday}
      />
    </div>
  );
}
