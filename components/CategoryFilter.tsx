import { Category } from '@/types/event';

interface CategoryFilterProps {
  selectedCategories: Category[];
  onCategoryToggle: (category: Category | 'all') => void;
}

const categoryLabels: Record<Category | 'all', string> = {
  all: 'All',
  work: 'Work',
  projects: 'Projects',
  personal: 'Personal',
  home: 'Home',
  benja: 'Benja',
  sophi: 'Sophi',
  other: 'Other',
};

const categoryColors: Record<Category, string> = {
  work: 'bg-blue-100 text-blue-700 border-blue-300',
  projects: 'bg-orange-100 text-orange-700 border-orange-300',
  personal: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  home: 'bg-teal-100 text-teal-700 border-teal-300',
  benja: 'bg-green-100 text-green-700 border-green-300',
  sophi: 'bg-rose-100 text-rose-700 border-rose-300',
  other: 'bg-gray-100 text-gray-700 border-gray-300',
};

export default function CategoryFilter({
  selectedCategories,
  onCategoryToggle,
}: CategoryFilterProps) {
  const categories: (Category | 'all')[] = ['all', 'work', 'projects', 'personal', 'home', 'benja', 'sophi', 'other'];
  const allSelected = selectedCategories.length === 0;

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
      <span className="text-sm font-medium text-gray-700 mr-2">Filter by:</span>
      {categories.map((category) => {
        const isSelected = category === 'all' ? allSelected : selectedCategories.includes(category as Category);
        const colorClass = category === 'all'
          ? 'bg-gray-900 text-white border-gray-900'
          : isSelected
            ? categoryColors[category as Category]
            : 'bg-white text-gray-600 border-gray-300';

        return (
          <button
            key={category}
            onClick={() => onCategoryToggle(category)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${colorClass} ${
              isSelected ? 'shadow-sm' : 'hover:bg-gray-50'
            }`}
          >
            {categoryLabels[category]}
          </button>
        );
      })}
    </div>
  );
}
