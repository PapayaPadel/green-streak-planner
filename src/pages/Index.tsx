import { useState } from 'react';
import { Settings } from 'lucide-react';
import { getWeekStart, goToNextWeek, goToPreviousWeek } from '@/lib/dateUtils';
import { WeekTasksProvider, HabitsProvider } from '@/contexts/TrackerContext';
import { TopSummarySection } from '@/components/TopSummarySection';
import { WeeklyGrid } from '@/components/WeeklyGrid';
import { SettingsPanel } from '@/components/SettingsPanel';
import { Button } from '@/components/ui/button';
import { SaveIndicator } from '@/components/SaveIndicator';
import { WeeklyExportReminder } from '@/components/WeeklyExportReminder';

function IndexContent({ weekStart, onPrev, onNext }: {
  weekStart: Date;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <WeeklyExportReminder />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSettingsOpen(true)}
        className="fixed top-2 right-2 z-30 bg-card shadow-md border border-border"
      >
        <Settings className="h-5 w-5" />
      </Button>

      <TopSummarySection
        weekStart={weekStart}
        onPreviousWeek={onPrev}
        onNextWeek={onNext}
      />

      <div className="w-full">
        <WeeklyGrid weekStart={weekStart} />
      </div>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <SaveIndicator />
    </div>
  );
}

const Index = () => {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  const handlePreviousWeek = () => setWeekStart((prev) => goToPreviousWeek(prev));
  const handleNextWeek = () => setWeekStart((prev) => goToNextWeek(prev));

  return (
    <WeekTasksProvider weekStart={weekStart}>
      <HabitsProvider weekStart={weekStart}>
        <IndexContent
          weekStart={weekStart}
          onPrev={handlePreviousWeek}
          onNext={handleNextWeek}
        />
      </HabitsProvider>
    </WeekTasksProvider>
  );
};

export default Index;
