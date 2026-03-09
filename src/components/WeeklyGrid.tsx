import { getDaysOfWeek } from '@/lib/dateUtils';
import { DayColumn } from './DayColumn';
import { useWeekTasksContext } from '@/contexts/TrackerContext';

interface WeeklyGridProps {
  weekStart: Date;
}

export function WeeklyGrid({ weekStart }: WeeklyGridProps) {
  const days = getDaysOfWeek(weekStart);
  const {
    getDayTasks,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    getDayStats,
  } = useWeekTasksContext();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 p-4">
      {days.map((date) => (
        <DayColumn
          key={date.toISOString()}
          date={date}
          tasks={getDayTasks(date)}
          stats={getDayStats(date)}
          onAddTask={(text) => addTask(date, text)}
          onToggleTask={(taskId) => toggleTask(date, taskId)}
          onUpdateTask={(taskId, newText) => updateTask(date, taskId, newText)}
          onDeleteTask={(taskId) => deleteTask(date, taskId)}
        />
      ))}
    </div>
  );
}
