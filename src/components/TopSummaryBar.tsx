import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatWeekRange } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';

interface TopSummaryBarProps {
  weekStart: Date;
  completedTasks: number;
  totalTasks: number;
  percentage: number;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export function TopSummaryBar({
  weekStart,
  completedTasks,
  totalTasks,
  percentage,
  onPreviousWeek,
  onNextWeek,
}: TopSummaryBarProps) {
  return (
    <div className="day-header px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousWeek}
          className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg md:text-xl font-semibold">
          {formatWeekRange(weekStart)}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextWeek}
          className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <span className="text-sm md:text-base font-medium">
          {completedTasks} / {totalTasks} Completed
        </span>
        
        <div className="flex items-center gap-2 flex-1 min-w-[120px] md:min-w-[200px]">
          <div className="flex-1 progress-bar-track rounded-full h-2.5 overflow-hidden">
            <div
              className="progress-bar-fill h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-bold min-w-[40px] text-right">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}
