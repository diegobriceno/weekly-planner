import { Task } from '@/types/task';
import TaskCard from './TaskCard';

interface CalendarGridProps {
  days: Date[];
  currentMonth: number;
  tasks: { [date: string]: Task[] };
  weekDayNames: string[];
  onDayClick: (date: Date) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export default function CalendarGrid({
  days,
  currentMonth,
  tasks,
  weekDayNames,
  onDayClick,
  onDeleteTask,
  onEditTask,
}: CalendarGridProps) {
  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {weekDayNames.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-medium text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const dateKey = formatDateKey(date);
          const dayTasks = tasks[dateKey] || [];
          const today = isToday(date);
          const currentMonthDay = isCurrentMonth(date);

          return (
            <div
              key={index}
              onClick={() => onDayClick(date)}
              className={`
                min-h-[120px] p-2 border-b border-r border-gray-200
                ${index % 7 === 6 ? 'border-r-0' : ''}
                ${index >= days.length - 7 ? 'border-b-0' : ''}
                ${!currentMonthDay ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}
                transition-colors cursor-pointer
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-sm font-medium
                    ${!currentMonthDay ? 'text-gray-400' : 'text-gray-900'}
                    ${today ? 'bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs' : ''}
                  `}
                >
                  {date.getDate()}
                </span>
              </div>

              <div className="space-y-0.5 overflow-hidden">
                {dayTasks.slice(0, 3).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={onDeleteTask}
                    onEdit={onEditTask}
                    compact
                  />
                ))}
                {dayTasks.length > 3 && (
                  <p className="text-xs text-gray-500 pl-2">
                    +{dayTasks.length - 3} more...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
