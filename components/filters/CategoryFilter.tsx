import { Category } from '@/types/event';
import CategoryFilterButtons from './CategoryFilterButtons';
import ViewModeToggle from '@/components/navigation/ViewModeToggle';
import CalendarNavigation from '@/components/navigation/CalendarNavigation';

interface CategoryFilterProps {
  disabledCategories: Category[];
  onCategoryToggle: (category: Category | 'all') => void;
  viewMode: 'month' | 'week';
  onViewModeChange: (mode: 'month' | 'week') => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export default function CategoryFilter({
  disabledCategories,
  onCategoryToggle,
  viewMode,
  onViewModeChange,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <CategoryFilterButtons
        disabledCategories={disabledCategories}
        onCategoryToggle={onCategoryToggle}
      />

      <div className="flex items-center gap-3">
        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />

        <CalendarNavigation
          onPrevious={onPreviousMonth}
          onToday={onToday}
          onNext={onNextMonth}
        />
      </div>
    </div>
  );
}
