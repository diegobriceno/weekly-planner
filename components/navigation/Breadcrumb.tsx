import { ChevronRight } from 'lucide-react';

export default function Breadcrumb() {
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-4">
      <a href="#" className="hover:text-gray-700 transition-colors">
        Home
      </a>
      <ChevronRight className="w-4 h-4 mx-2" />
      <span className="text-gray-900 font-medium">Calendar</span>
    </nav>
  );
}
