import { useState, useMemo } from 'react';
import { getDaysOfWeek, isToday } from '@/lib/dateUtils';
import { DayColumn } from './DayColumn';
import { MobileDayCard } from './MobileDayCard';
import { useWeekTasksContext } from '@/contexts/TrackerContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface WeeklyGridProps {
  weekStart: Date;
}

export function WeeklyGrid({ weekStart }: WeeklyGridProps) {
  const days = getDaysOfWeek(weekStart);
  const isMobile = useIsMobile();
  const {
    getDayTasks,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    getDayStats,
  } = useWeekTasksContext();

  // Find today's index for mobile default
  const todayIdx = useMemo(() => {
    const idx = days.findIndex((d) => isToday(d));
    return idx >= 0 ? idx : 0;
  }, [days]);

  const [mobileDayIndex, setMobileDayIndex] = useState(todayIdx);

  if (isMobile) {
    const date = days[mobileDayIndex];
    return (
      <MobileDayCard
        date={date}
        dayIndex={mobileDayIndex}
        totalDays={7}
        tasks={getDayTasks(date)}
        stats={getDayStats(date)}
        onAddTask={(text) => addTask(date, text)}
        onToggleTask={(taskId) => toggleTask(date, taskId)}
        onUpdateTask={(taskId, newText) => updateTask(date, taskId, newText)}
        onDeleteTask={(taskId) => deleteTask(date, taskId)}
        onPrevDay={() => setMobileDayIndex((i) => Math.max(0, i - 1))}
        onNextDay={() => setMobileDayIndex((i) => Math.min(6, i + 1))}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-3 p-4">
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
