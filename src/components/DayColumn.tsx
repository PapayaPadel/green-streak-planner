import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Check, Repeat } from 'lucide-react';
import { Task, RecurringTaskDef } from '@/hooks/useWeekTasks';
import { isToday } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MiniDonut } from '@/components/MiniDonut';
import { RecurrencePopover, CopyDropdown } from '@/components/TaskActions';
import { cn } from '@/lib/utils';

interface DayColumnProps {
  date: Date;
  tasks: Task[];
  stats: { total: number; completed: number; percentage: number };
  onAddTask: (text: string) => void;
  onToggleTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, newText: string) => void;
  onDeleteTask: (taskId: string) => void;
  days: Date[];
  getRecurringDef: (task: Task) => RecurringTaskDef | undefined;
  onSetRecurrence: (taskId: string, days: number[]) => void;
  onCopyToDay: (task: Task, targetDate: Date) => void;
  onCopyToNextWeek: (task: Task) => void;
}

export function DayColumn({
  date, tasks, stats,
  onAddTask, onToggleTask, onUpdateTask, onDeleteTask,
  days, getRecurringDef, onSetRecurrence, onCopyToDay, onCopyToNextWeek,
}: DayColumnProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const dayName = format(date, 'EEEE');
  const dayDate = format(date, 'MMM d');
  const today = isToday(date);
  const allCompleted = stats.total > 0 && stats.completed === stats.total;

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
  };

  const handleSaveEdit = (taskId: string) => {
    if (editText.trim()) onUpdateTask(taskId, editText.trim());
    setEditingTaskId(null);
    setEditText('');
  };

  return (
    <div className="flex flex-col bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className={cn('px-3 py-2 relative', allCompleted ? 'day-header-today' : (today ? 'day-header-today' : 'day-header'))}>
        <div className="font-bold text-center">{dayName}</div>
        <div className="text-sm italic text-center opacity-90">{dayDate}</div>
        {allCompleted && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary-foreground/25 flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-3 py-3 border-b border-border bg-card flex flex-col items-center gap-1">
        <MiniDonut percentage={stats.percentage} size={56} strokeWidth={4} />
        <div className="text-xs text-muted-foreground italic text-center">
          {stats.completed} / {stats.total} done
        </div>
      </div>

      {/* Tasks Label */}
      <div className="px-3 py-1.5 bg-light-green">
        <span className="text-xs font-semibold text-light-green-foreground uppercase tracking-wide">Tasks</span>
      </div>

      {/* Task List */}
      <div className="flex-1 px-2 py-1 min-h-[120px] max-h-[280px] overflow-y-auto">
        {tasks.map((task, index) => {
          const recurringDef = getRecurringDef(task);
          return (
            <div key={task.id} className={cn('flex items-center gap-1.5 py-1.5 px-2 rounded group', index % 2 === 0 ? 'bg-card' : 'bg-pale-green')}>
              <button onClick={() => onToggleTask(task.id)}
                className={cn('w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                  task.completed ? 'bg-accent-green border-accent-green animate-check-bounce' : 'border-muted-foreground/40 hover:border-accent-green'
                )}>
                {task.completed && <Check className="w-3 h-3 text-accent-green-foreground" />}
              </button>

              {editingTaskId === task.id ? (
                <Input value={editText} onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => handleSaveEdit(task.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
                  className="flex-1 h-7 text-sm" autoFocus />
              ) : (
                <span onClick={() => handleStartEdit(task)}
                  className={cn('flex-1 text-sm cursor-pointer break-words whitespace-normal', task.completed && 'task-done')}
                  title={task.text}>
                  {task.text}
                </span>
              )}

              {task.recurringId && <Repeat className="w-3 h-3 text-primary opacity-50 shrink-0" />}

              <div className="flex gap-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <RecurrencePopover task={task} recurringDef={recurringDef} onSave={onSetRecurrence} />
                <CopyDropdown task={task} date={date} days={days} onCopyToDay={onCopyToDay} onCopyToNextWeek={onCopyToNextWeek} />
                <Button variant="ghost" size="icon" onClick={() => onDeleteTask(task.id)}
                  className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-4 italic">No tasks yet</div>
        )}
      </div>

      {/* Add Task */}
      <div className="px-2 py-2 border-t border-border">
        {isAddingTask ? (
          <div className="flex gap-1">
            <Input value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add task..." className="flex-1 h-8 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} autoFocus />
            <Button size="sm" onClick={handleAddTask} className="h-8 px-2">
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setIsAddingTask(true)}
            className="w-full h-8 text-muted-foreground hover:text-accent-green">
            <Plus className="h-4 w-4 mr-1" />Add Task
          </Button>
        )}
      </div>
    </div>
  );
}
