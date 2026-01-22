import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarNavigationProps {
  onPrevious: () => void;
  onToday: () => void;
  onNext: () => void;
}

export default function CalendarNavigation({
  onPrevious,
  onToday,
  onNext,
}: CalendarNavigationProps) {
  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-lg">
      <button
        onClick={onPrevious}
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
        onClick={onNext}
        className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}
