import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Check, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '@/hooks/useWeekTasks';
import { isToday } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MiniDonut } from '@/components/MiniDonut';
import { cn } from '@/lib/utils';

interface MobileDayCardProps {
  date: Date;
  dayIndex: number;
  totalDays: number;
  tasks: Task[];
  stats: { total: number; completed: number; percentage: number };
  onAddTask: (text: string) => void;
  onToggleTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, newText: string) => void;
  onDeleteTask: (taskId: string) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
}

export function MobileDayCard({
  date,
  dayIndex,
  totalDays,
  tasks,
  stats,
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onPrevDay,
  onNextDay,
}: MobileDayCardProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const today = isToday(date);
  const dayName = format(date, 'EEEE');
  const dayDate = format(date, 'MMM d');

  const handleAdd = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
      setIsAdding(false);
    }
  };

  const handleSaveEdit = (taskId: string) => {
    if (editText.trim()) onUpdateTask(taskId, editText.trim());
    setEditingTaskId(null);
    setEditText('');
  };

  return (
    <div className="px-4 pb-24">
      {/* Header with nav arrows */}
      <div className={cn('flex items-center justify-between px-4 py-3 rounded-t-lg -mx-4', today ? 'day-header-today' : 'day-header')}>
        <Button variant="ghost" size="icon" onClick={onPrevDay} disabled={dayIndex === 0} className="text-primary-foreground hover:bg-primary-foreground/10 h-10 w-10 disabled:opacity-30">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <div className="font-bold text-lg">{dayName}</div>
          <div className="text-sm opacity-90">{dayDate}</div>
        </div>
        <Button variant="ghost" size="icon" onClick={onNextDay} disabled={dayIndex === totalDays - 1} className="text-primary-foreground hover:bg-primary-foreground/10 h-10 w-10 disabled:opacity-30">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Donut stats */}
      <div className="flex flex-col items-center py-4 border-b border-border bg-card rounded-b-lg -mx-4 px-4">
        <MiniDonut percentage={stats.percentage} size={72} strokeWidth={5} />
        <div className="text-xs text-muted-foreground mt-1">
          {stats.completed} / {stats.total} done
        </div>
      </div>

      {/* Task list */}
      <div className="mt-3 space-y-1">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 min-h-[44px] py-2 px-2 rounded bg-card">
            {/* Large toggle area */}
            <button
              onClick={() => onToggleTask(task.id)}
              className={cn(
                'w-7 h-7 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                task.completed
                  ? 'bg-accent-green border-accent-green animate-check-bounce'
                  : 'border-muted-foreground/40 hover:border-accent-green'
              )}
            >
              {task.completed && <Check className="w-4 h-4 text-accent-green-foreground" />}
            </button>

            {editingTaskId === task.id ? (
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => handleSaveEdit(task.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
                className="flex-1 h-10 text-sm"
                autoFocus
              />
            ) : (
              <span className={cn('flex-1 text-sm break-words', task.completed && 'task-done')}>
                {task.text}
              </span>
            )}

            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" onClick={() => { setEditingTaskId(task.id); setEditText(task.text); }} className="h-9 w-9 text-muted-foreground">
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDeleteTask(task.id)} className="h-9 w-9 text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-6 italic">No tasks yet</div>
        )}
      </div>

      {/* Day indicator */}
      <div className="text-center text-xs text-muted-foreground mt-4">
        Day {dayIndex + 1} of {totalDays}
      </div>

      {/* Inline add area (shown when tapping FAB) */}
      {isAdding && (
        <div className="fixed bottom-20 left-4 right-4 z-40 bg-card border border-border rounded-lg shadow-lg p-3 flex gap-2">
          <Input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="New task..."
            className="flex-1 h-11 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <Button onClick={handleAdd} className="h-11 px-4">
            <Check className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors"
        style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
      >
        <Plus className={cn('h-6 w-6 transition-transform', isAdding && 'rotate-45')} />
      </button>
    </div>
  );
}
