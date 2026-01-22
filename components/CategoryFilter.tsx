import { Category } from '@/types/event';

interface CategoryFilterProps {
  disabledCategories: Category[];
  onCategoryToggle: (category: Category | 'all') => void;
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
}: CategoryFilterProps) {
  const categories: (Category | 'all')[] = ['all', 'work', 'projects', 'personal', 'home', 'finances', 'other'];
  const allCategories: Category[] = ['work', 'projects', 'personal', 'home', 'finances', 'other'];

  // 'All' is active when at least one category is enabled (not all are disabled)
  const allActive = disabledCategories.length < allCategories.length;

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
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
  );
}
