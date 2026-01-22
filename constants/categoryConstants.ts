import { Category } from '@/types/event';

/**
 * Category-related constants
 */

export const categoryLabels: Record<Category | 'all', string> = {
  all: 'All',
  work: 'Work',
  projects: 'Projects',
  personal: 'Personal',
  home: 'Home',
  finances: 'Finances',
  other: 'Other',
};

// All categories except 'all'
export const allCategories: Category[] = [
  'work',
  'projects',
  'personal',
  'home',
  'finances',
  'other',
];

// Categories with 'all' included
export const categoriesWithAll: (Category | 'all')[] = [
  'all',
  ...allCategories,
];

/**
 * Category colors for different use cases
 */
export const categoryColors: Record<
  Category,
  {
    // For filter buttons (lighter backgrounds)
    filter: string;
    // For event cards (structured colors)
    card: {
      bg: string;
      text: string;
      dot: string;
      border: string;
    };
  }
> = {
  work: {
    filter: 'bg-blue-100 text-blue-700 border-blue-300',
    card: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      border: 'border-blue-200',
    },
  },
  projects: {
    filter: 'bg-orange-100 text-orange-700 border-orange-300',
    card: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      dot: 'bg-orange-500',
      border: 'border-orange-200',
    },
  },
  personal: {
    filter: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    card: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      dot: 'bg-yellow-500',
      border: 'border-yellow-200',
    },
  },
  home: {
    filter: 'bg-red-100 text-red-700 border-red-300',
    card: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      dot: 'bg-red-500',
      border: 'border-red-200',
    },
  },
  finances: {
    filter: 'bg-green-100 text-green-700 border-green-300',
    card: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      dot: 'bg-green-500',
      border: 'border-green-200',
    },
  },
  other: {
    filter: 'bg-gray-100 text-gray-700 border-gray-300',
    card: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      dot: 'bg-gray-500',
      border: 'border-gray-200',
    },
  },
};
