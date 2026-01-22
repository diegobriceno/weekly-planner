import { Category } from '@/types/event';
import { ChevronLeft, ChevronRight, Calendar, CalendarRange } from 'lucide-react';

interface CategoryFilterProps {
  disabledCategories: Category[];
  onCategoryToggle: (category: Category | 'all') => void;
  viewMode: 'month' | 'week';
  onViewModeChange: (mode: 'month' | 'week') => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const categoryLabels: Record<Category | 'all', string> = {
  all: 'All',
  work: 'Work',
  projects: 'Projects',
  personal: 'Personal',
  home: 'Home',
  finances: 'Finances',
  other: 'Other',
};

const categoryColors: Record<Category, string> = {
  work: 'bg-blue-100 text-blue-700 border-blue-300',
  projects: 'bg-orange-100 text-orange-700 border-orange-300',
  personal: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  home: 'bg-red-100 text-red-700 border-red-300',
  finances: 'bg-green-100 text-green-700 border-green-300',
  other: 'bg-gray-100 text-gray-700 border-gray-300',
};

export default function CategoryFilter({
  disabledCategories,
  onCategoryToggle,
  viewMode,
  onViewModeChange,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CategoryFilterProps) {
  const categories: (Category | 'all')[] = ['all', 'work', 'projects', 'personal', 'home', 'finances', 'other'];
  const allCategories: Category[] = ['work', 'projects', 'personal', 'home', 'finances', 'other'];

  // 'All' is active when at least one category is enabled (not all are disabled)
  const allActive = disabledCategories.length < allCategories.length;

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700 mr-2">Filter by:</span>
        {categories.map((category) => {
          // A category is active if it's NOT in disabledCategories
          const isActive = category === 'all'
            ? allActive
            : !disabledCategories.includes(category as Category);

          const colorClass = category === 'all'
            ? isActive
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-300'
            : isActive
              ? categoryColors[category as Category]
              : 'bg-white text-gray-600 border-gray-300';

          return (
            <button
              key={category}
              onClick={() => onCategoryToggle(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${colorClass} ${
                isActive ? 'shadow-sm' : 'hover:bg-gray-50'
              }`}
            >
              {categoryLabels[category]}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        {/* View mode buttons */}
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

        {/* Navigation buttons */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg">
          <button
            onClick={onPreviousMonth}
            className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
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
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
