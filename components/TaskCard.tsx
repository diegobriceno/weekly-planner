import { Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  compact?: boolean;
}

const categoryColors: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  work: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  projects: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-200' },
  personal: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500', border: 'border-yellow-200' },
  home: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500', border: 'border-teal-200' },
  benja: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
  sophi: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-200' },
  other: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500', border: 'border-gray-200' },
};

export default function TaskCard({ task, onDelete, onEdit, compact = false }: TaskCardProps) {
  const colors = categoryColors[task.category];

  return (
    <div
      onClick={() => onEdit(task)}
      className={`${colors.bg} ${colors.border} border rounded px-2 py-1 mb-1 group hover:shadow-sm transition-all cursor-pointer`}
    >
      <div className="flex items-start gap-1.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <p className={`text-xs font-medium ${colors.text} truncate`}>
              {task.name}
            </p>
            {task.time && (
              <span className={`text-xs font-bold ${colors.text}`}>
                {task.time}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 text-xs flex-shrink-0"
          aria-label="Delete task"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
