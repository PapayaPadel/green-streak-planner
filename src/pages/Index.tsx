import { useState } from 'react';
import { Settings } from 'lucide-react';
import { getWeekStart, goToNextWeek, goToPreviousWeek } from '@/lib/dateUtils';
import { WeekTasksProvider, HabitsProvider, useWeekTasksContext } from '@/contexts/TrackerContext';
import { TopSummaryBar } from '@/components/TopSummaryBar';
import { WeeklyGrid } from '@/components/WeeklyGrid';
import { HabitTrackerPanel } from '@/components/HabitTrackerPanel';
import { Dashboard } from '@/components/Dashboard';
import { SettingsPanel } from '@/components/SettingsPanel';
import { Button } from '@/components/ui/button';
import { SaveIndicator } from '@/components/SaveIndicator';

function WeeklySummaryBar({ weekStart, onPrev, onNext }: {
  weekStart: Date;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { getWeekStats } = useWeekTasksContext();
  const weekStats = getWeekStats();
  return (
    <TopSummaryBar
      weekStart={weekStart}
      completedTasks={weekStats.completedTasks}
      totalTasks={weekStats.totalTasks}
      percentage={weekStats.percentage}
      onPreviousWeek={onPrev}
      onNextWeek={onNext}
    />
  );
}

const Index = () => {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handlePreviousWeek = () => setWeekStart((prev) => goToPreviousWeek(prev));
  const handleNextWeek = () => setWeekStart((prev) => goToNextWeek(prev));

  return (
    <WeekTasksProvider weekStart={weekStart}>
      <HabitsProvider weekStart={weekStart}>
        <div className="min-h-screen bg-background">
          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="fixed top-2 right-2 z-30 bg-card shadow-md border border-border"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Top Summary Bar */}
          <WeeklySummaryBar
            weekStart={weekStart}
            onPrev={handlePreviousWeek}
            onNext={handleNextWeek}
          />

          {/* Weekly Grid */}
          <div className="w-full">
            <WeeklyGrid weekStart={weekStart} />
          </div>

          {/* Habit Tracker Panel */}
          <div className="px-4 pb-4">
            <HabitTrackerPanel weekStart={weekStart} />
          </div>

          {/* Dashboard */}
          <div className="border-t border-border">
            <Dashboard weekStart={weekStart} />
          </div>

          {/* Settings Panel */}
          <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
      </HabitsProvider>
    </WeekTasksProvider>
  );
};

export default Index;
