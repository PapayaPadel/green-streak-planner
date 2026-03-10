import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysOfWeek, SHORT_DAY_NAMES, formatWeekRange } from '@/lib/dateUtils';
import { useWeekTasksContext, useHabitsContext } from '@/contexts/TrackerContext';
import { HabitStatus, Habit } from '@/hooks/useHabits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TopSummarySectionProps {
  weekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

function HabitStatusButton({ status, onClick }: { status: HabitStatus; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-6 h-6 rounded text-xs font-medium flex items-center justify-center transition-all',
        status === 'done' && 'habit-done',
        status === 'missed' && 'habit-missed',
        status === 'clear' && 'habit-clear hover:bg-light-green'
      )}
    >
      {status === 'done' && <Check className="w-3 h-3" />}
      {status === 'missed' && <X className="w-3 h-3" />}
    </button>
  );
}

export function TopSummarySection({ weekStart, onPreviousWeek, onNextWeek }: TopSummarySectionProps) {
  const days = getDaysOfWeek(weekStart);
  const { getDayStats, getWeekStats } = useWeekTasksContext();
  const {
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    cycleHabitStatus,
    getHabitStatus,
    getHabitWeeklyRate,
  } = useHabitsContext();

  const weekStats = getWeekStats();

  const [newHabitName, setNewHabitName] = useState('');
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Bar chart data
  const barChartData = days.map((date, index) => ({
    day: SHORT_DAY_NAMES[index],
    completed: getDayStats(date).completed,
  }));

  // Donut data
  const donutData = [
    { name: 'Completed', value: weekStats.completedTasks },
    { name: 'Remaining', value: Math.max(0, weekStats.totalTasks - weekStats.completedTasks) },
  ];
  if (donutData[0].value === 0 && donutData[1].value === 0) {
    donutData[1].value = 1;
  }

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
    <div className="bg-card border-b border-border">
      {/* Week nav bar */}
      <div className="day-header px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onPreviousWeek} className="text-primary-foreground hover:bg-primary-foreground/10 h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-base font-semibold">{formatWeekRange(weekStart)}</h1>
          <Button variant="ghost" size="icon" onClick={onNextWeek} className="text-primary-foreground hover:bg-primary-foreground/10 h-7 w-7">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-sm font-medium">{weekStats.completedTasks} / {weekStats.totalTasks} Completed</span>
      </div>

      {/* Three-panel row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_2fr] gap-0 lg:gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* LEFT: Bar chart */}
        <div className="p-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Tasks per Day</h3>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <XAxis dataKey="day" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} width={20} />
                <Bar dataKey="completed" radius={[3, 3, 0, 0]} fill="hsl(var(--accent-green))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CENTER: Donut chart */}
        <div className="p-4 flex flex-col items-center justify-center min-w-[160px]">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Weekly</h3>
          <div className="relative w-[120px] h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={38} outerRadius={54} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
                  <Cell fill="hsl(var(--primary))" />
                  <Cell fill="hsl(var(--light-green))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-primary">{weekStats.percentage}%</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Habit tracker */}
        <div className="p-3 overflow-hidden">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Habit Tracker</h3>

          {/* Header row */}
          <div className="flex items-center gap-1 mb-1">
            <div className="w-24 shrink-0 text-[10px] font-medium text-muted-foreground">Habit</div>
            <div className="flex gap-0.5">
              {SHORT_DAY_NAMES.map((day) => (
                <div key={day} className="w-6 text-center text-[10px] font-medium text-muted-foreground">{day}</div>
              ))}
            </div>
            <div className="w-14 text-[10px] font-medium text-muted-foreground text-center">Rate</div>
            <div className="w-12" />
          </div>

          {/* Habit rows */}
          <div className="space-y-0.5 max-h-[120px] overflow-y-auto">
            {habits.map((habit, index) => {
              const rate = getHabitWeeklyRate(habit.id);
              return (
                <div
                  key={habit.id}
                  className={cn(
                    'flex items-center gap-1 py-1 px-1 rounded group',
                    index % 2 === 0 ? 'bg-card' : 'bg-pale-green'
                  )}
                >
                  {editingHabitId === habit.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSaveEdit(habit.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(habit.id)}
                      className="w-24 shrink-0 h-6 text-xs"
                      autoFocus
                    />
                  ) : (
                    <span className="w-24 shrink-0 text-xs truncate">{habit.name}</span>
                  )}

                  <div className="flex gap-0.5">
                    {Array.from({ length: 7 }).map((_, dayIndex) => (
                      <HabitStatusButton
                        key={dayIndex}
                        status={getHabitStatus(habit.id, dayIndex)}
                        onClick={() => cycleHabitStatus(habit.id, dayIndex)}
                      />
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="w-14 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${rate}%`,
                        backgroundColor: 'hsl(var(--accent-green))',
                      }}
                    />
                  </div>

                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleStartEdit(habit)} className="h-5 w-5 text-muted-foreground hover:text-primary">
                      <Edit2 className="h-2.5 w-2.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteHabit(habit.id)} className="h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {habits.length === 0 && (
              <div className="text-center text-muted-foreground text-xs py-3 italic">No habits yet</div>
            )}
          </div>

          {/* Add habit */}
          <div className="mt-2 pt-2 border-t border-border">
            {isAddingHabit ? (
              <div className="flex gap-1">
                <Input
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Habit name..."
                  className="flex-1 h-7 text-xs"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                  autoFocus
                />
                <Button size="sm" onClick={handleAddHabit} className="h-7 px-2">
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingHabit(true)}
                className="w-full h-7 text-xs text-muted-foreground hover:text-accent-green"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Habit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
