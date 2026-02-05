'use client';

import { motion } from 'framer-motion';
import { Category } from '@/types/event';
import { categoriesWithAll, categoryLabels } from '@/constants/categoryConstants';
import { isCategoryActive, getCategoryFilterColorClass } from '@/utils/categoryHelpers';

interface CategoryFilterButtonsProps {
  disabledCategories: Category[];
  onCategoryToggle: (category: Category | 'all') => void;
}

export default function CategoryFilterButtons({
  disabledCategories,
  onCategoryToggle,
}: CategoryFilterButtonsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-gray-700 mr-2">Filter by:</span>
      {categoriesWithAll.map((category, index) => {
        const isActive = isCategoryActive(category, disabledCategories);
        const colorClass = getCategoryFilterColorClass(category, isActive);

        return (
          <motion.button
            key={category}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            onClick={() => onCategoryToggle(category)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${colorClass} ${
              isActive ? 'shadow-sm' : 'hover:bg-gray-50'
            }`}
          >
            {categoryLabels[category]}
          </motion.button>
        );
      })}
    </div>
  );
}
