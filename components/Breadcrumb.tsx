export default function Breadcrumb() {
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-4">
      <a href="#" className="hover:text-gray-700 transition-colors">
        Home
      </a>
      <svg
        className="w-4 h-4 mx-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
      <span className="text-gray-900 font-medium">Calendar</span>
    </nav>
  );
}
