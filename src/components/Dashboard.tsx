import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, Tooltip } from 'recharts';
import { Flame } from 'lucide-react';
import { getDaysOfWeek, SHORT_DAY_NAMES } from '@/lib/dateUtils';
import { useWeekTasks } from '@/hooks/useWeekTasks';
import { useHabits } from '@/hooks/useHabits';
import { cn } from '@/lib/utils';

interface DashboardProps {
  weekStart: Date;
}

export function Dashboard({ weekStart }: DashboardProps) {
  const days = getDaysOfWeek(weekStart);
  const { getDayStats, getWeekStats } = useWeekTasks(weekStart);
  const { habits, getHabitWeeklyRate, calculateStreak } = useHabits(weekStart);

  const weekStats = getWeekStats();

  // Bar chart data
  const barChartData = days.map((date, index) => ({
    day: SHORT_DAY_NAMES[index],
    completed: getDayStats(date).completed,
  }));

  // Donut chart data
  const donutData = [
    { name: 'Completed', value: weekStats.completedTasks },
    { name: 'Remaining', value: Math.max(0, weekStats.totalTasks - weekStats.completedTasks) },
  ];

  const getRateColor = (rate: number) => {
    if (rate >= 80) return 'bg-accent-green';
    if (rate >= 60) return 'bg-light-green';
    if (rate >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Bar Chart - Tasks per day */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-sm mb-3 text-foreground">Tasks Completed per Day</h3>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 10 }} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                axisLine={false} 
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip />
              <Bar dataKey="completed" radius={[4, 4, 0, 0]} fill="hsl(122, 39%, 49%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Chart - Weekly completion */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-sm mb-3 text-foreground">Weekly Completion</h3>
        <div className="h-[180px] flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                <Cell className="fill-primary" />
                <Cell className="fill-light-green" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">{weekStats.percentage}%</span>
          </div>
        </div>
      </div>

      {/* Habit Consistency Table */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-sm mb-3 text-foreground">Habit Consistency</h3>
        <div className="space-y-2 max-h-[180px] overflow-y-auto">
          {habits.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-4">No habits yet</p>
          ) : (
            habits.map((habit) => {
              const rate = getHabitWeeklyRate(habit.id);
              return (
                <div key={habit.id} className="flex items-center gap-2">
                  <span className="flex-1 text-sm truncate">{habit.name}</span>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', getRateColor(rate))}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{rate}%</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Streak Counter */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-sm mb-3 text-foreground">Current Streaks</h3>
        <div className="space-y-2 max-h-[180px] overflow-y-auto">
          {habits.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-4">No habits yet</p>
          ) : (
            habits.map((habit) => {
              const streak = calculateStreak(habit.id);
              return (
                <div key={habit.id} className="flex items-center gap-2 py-1">
                  <Flame className={cn(
                    'w-4 h-4',
                    streak > 0 ? 'text-warning' : 'text-muted-foreground/30'
                  )} />
                  <span className="flex-1 text-sm truncate">{habit.name}</span>
                  <span className={cn(
                    'text-sm font-bold',
                    streak > 0 ? 'text-warning' : 'text-muted-foreground'
                  )}>
                    {streak} {streak === 1 ? 'day' : 'days'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
