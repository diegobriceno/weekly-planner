import { Task } from '@/types/task';
import TaskCard from './TaskCard';

interface WeeklyViewProps {
  weekDays: Date[];
  tasks: { [date: string]: Task[] };
  onDayClick: (date: Date) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export default function WeeklyView({
  weekDays,
  tasks,
  onDayClick,
  onDeleteTask,
  onEditTask,
}: WeeklyViewProps) {
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

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {weekDays.map((date, index) => {
          const dateKey = formatDateKey(date);
          const dayTasks = tasks[dateKey] || [];
          const today = isToday(date);

          return (
            <div key={index} className="bg-white">
              <div className="border-b border-gray-200 p-3 text-center">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  {dayNames[index]}
                </p>
                <p
                  className={`text-sm font-semibold inline-flex items-center justify-center ${
                    today
                      ? 'bg-gray-900 text-white w-7 h-7 rounded-full'
                      : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </p>
              </div>

              <div
                onClick={() => onDayClick(date)}
                className="min-h-[500px] p-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="space-y-1">
                  {dayTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={onDeleteTask}
                      onEdit={onEditTask}
                    />
                  ))}
                </div>

                {dayTasks.length === 0 && (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-xs text-gray-400">No events</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
