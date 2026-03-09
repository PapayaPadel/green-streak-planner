import { useState } from 'react';
import { Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import { Habit, HabitStatus, useHabits } from '@/hooks/useHabits';
import { SHORT_DAY_NAMES } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface HabitTrackerPanelProps {
  weekStart: Date;
}

function HabitStatusButton({ status, onClick }: { status: HabitStatus; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-7 h-7 rounded text-xs font-medium flex items-center justify-center transition-all',
        status === 'done' && 'habit-done',
        status === 'missed' && 'habit-missed',
        status === 'clear' && 'habit-clear hover:bg-light-green'
      )}
    >
      {status === 'done' && <Check className="w-3.5 h-3.5" />}
      {status === 'missed' && <X className="w-3.5 h-3.5" />}
    </button>
  );
}

export function HabitTrackerPanel({ weekStart }: HabitTrackerPanelProps) {
  const {
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    cycleHabitStatus,
    getHabitStatus,
    getDayHabitStats,
  } = useHabits(weekStart);

  const [newHabitName, setNewHabitName] = useState('');
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      addHabit(newHabitName.trim());
      setNewHabitName('');
      setIsAddingHabit(false);
    }
  };

  const handleStartEdit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setEditName(habit.name);
  };

  const handleSaveEdit = (habitId: string) => {
    if (editName.trim()) {
      updateHabit(habitId, editName.trim());
    }
    setEditingHabitId(null);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      <div className="day-header px-4 py-3">
        <h2 className="font-bold text-lg">Habit Tracker</h2>
      </div>

      <div className="p-3">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-2 px-2">
          <div className="flex-1 text-xs font-medium text-muted-foreground">Habit</div>
          <div className="flex gap-1">
            {SHORT_DAY_NAMES.map((day) => (
              <div key={day} className="w-7 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="w-12" /> {/* Space for actions */}
        </div>

        {/* Habit rows */}
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {habits.map((habit, index) => (
            <div
              key={habit.id}
              className={cn(
                'flex items-center gap-2 py-1.5 px-2 rounded group',
                index % 2 === 0 ? 'bg-card' : 'bg-pale-green'
              )}
            >
              {editingHabitId === habit.id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleSaveEdit(habit.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(habit.id)}
                  className="flex-1 h-7 text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm truncate">{habit.name}</span>
              )}

              <div className="flex gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <HabitStatusButton
                    key={dayIndex}
                    status={getHabitStatus(habit.id, dayIndex)}
                    onClick={() => cycleHabitStatus(habit.id, dayIndex)}
                  />
                ))}
              </div>

              <div className="w-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleStartEdit(habit)}
                  className="h-6 w-6 text-muted-foreground hover:text-primary"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteHabit(habit.id)}
                  className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {habits.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-4 italic">
              No habits tracked yet
            </div>
          )}
        </div>

        {/* Weekly score row */}
        {habits.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border px-2">
            <div className="flex-1 text-xs font-semibold text-muted-foreground">Daily Score</div>
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const stats = getDayHabitStats(dayIndex);
                return (
                  <div key={dayIndex} className="w-7 text-center text-xs font-medium text-primary">
                    {stats.completed}/{stats.total}
                  </div>
                );
              })}
            </div>
            <div className="w-12" />
          </div>
        )}

        {/* Add habit */}
        <div className="mt-3 pt-3 border-t border-border">
          {isAddingHabit ? (
            <div className="flex gap-1">
              <Input
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Habit name..."
                className="flex-1 h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                autoFocus
              />
              <Button size="sm" onClick={handleAddHabit} className="h-8 px-2">
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingHabit(true)}
              className="w-full h-8 text-muted-foreground hover:text-accent-green"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Habit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
