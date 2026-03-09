import { useState } from 'react';
import { Settings } from 'lucide-react';
import { getWeekStart, goToNextWeek, goToPreviousWeek } from '@/lib/dateUtils';
import { useWeekTasks } from '@/hooks/useWeekTasks';
import { TopSummaryBar } from '@/components/TopSummaryBar';
import { WeeklyGrid } from '@/components/WeeklyGrid';
import { HabitTrackerPanel } from '@/components/HabitTrackerPanel';
import { Dashboard } from '@/components/Dashboard';
import { SettingsPanel } from '@/components/SettingsPanel';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const { getWeekStats } = useWeekTasks(weekStart);
  const weekStats = getWeekStats();

  const handlePreviousWeek = () => {
    setWeekStart((prev) => goToPreviousWeek(prev));
  };

  const handleNextWeek = () => {
    setWeekStart((prev) => goToNextWeek(prev));
  };

  return (
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
      <TopSummaryBar
        weekStart={weekStart}
        completedTasks={weekStats.completedTasks}
        totalTasks={weekStats.totalTasks}
        percentage={weekStats.percentage}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
      />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 p-4">
        {/* Weekly Grid */}
        <div className="flex-1">
          <WeeklyGrid weekStart={weekStart} />
        </div>

        {/* Habit Tracker Panel */}
        <div className="lg:w-[400px] xl:w-[450px]">
          <HabitTrackerPanel weekStart={weekStart} />
        </div>
      </div>

      {/* Dashboard */}
      <div className="border-t border-border">
        <Dashboard weekStart={weekStart} />
      </div>

      {/* Settings Panel */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default Index;
