import { Category } from '@/types/event';
import { categoryColors, allCategories } from '@/constants/categoryConstants';

/**
 * Category utility functions
 */

/**
 * Checks if a category is active (not disabled)
 */
export const isCategoryActive = (
  category: Category | 'all',
  disabledCategories: Category[]
): boolean => {
  if (category === 'all') {
    // 'All' is active when at least one category is enabled
    return disabledCategories.length < allCategories.length;
  }
  return !disabledCategories.includes(category);
};

/**
 * Gets the color class for a category in the filter
 */
export const getCategoryFilterColorClass = (
  category: Category | 'all',
  isActive: boolean
): string => {
  if (category === 'all') {
    return isActive
      ? 'bg-gray-900 text-white border-gray-900'
      : 'bg-white text-gray-600 border-gray-300';
  }

  return isActive
    ? categoryColors[category].filter
    : 'bg-white text-gray-600 border-gray-300';
};
