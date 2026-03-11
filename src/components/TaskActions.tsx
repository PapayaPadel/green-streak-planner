import { useState } from 'react';
import { Repeat, Copy, Check, X } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Task, RecurringTaskDef } from '@/hooks/useWeekTasks';
import { SHORT_DAY_NAMES } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RecurrencePopoverProps {
  task: Task;
  recurringDef?: RecurringTaskDef;
  onSave: (taskId: string, days: number[]) => void;
  compact?: boolean;
}

export function RecurrencePopover({ task, recurringDef, onSave, compact = true }: RecurrencePopoverProps) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState<number[]>(recurringDef?.days || []);

  const toggleDay = (d: number) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());
  };

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) setDays(recurringDef?.days || []);
    }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon"
          className={cn(
            'text-muted-foreground hover:text-primary',
            compact ? 'h-6 w-6' : 'h-9 w-9',
            task.recurringId && 'text-primary'
          )}>
          <Repeat className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="end">
        <p className="text-xs font-medium mb-2">Repeat on</p>
        <div className="flex gap-1 mb-3">
          {SHORT_DAY_NAMES.map((name, i) => (
            <button key={i} onClick={() => toggleDay(i)}
              className={cn('w-8 h-8 rounded text-xs font-medium transition-colors',
                days.includes(i) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
              {name}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <Button size="sm" className="h-7 text-xs" onClick={() => { onSave(task.id, days); setOpen(false); }}>
            Save
          </Button>
          {recurringDef && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => { onSave(task.id, []); setOpen(false); }}>
              Remove
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface CopyDropdownProps {
  task: Task;
  date: Date;
  days: Date[];
  onCopyToDay: (task: Task, targetDate: Date) => void;
  onCopyToNextWeek: (task: Task) => void;
  compact?: boolean;
}

export function CopyDropdown({ task, date, days, onCopyToDay, onCopyToNextWeek, compact = true }: CopyDropdownProps) {
  const tomorrow = addDays(date, 1);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"
          className={cn('text-muted-foreground hover:text-primary', compact ? 'h-6 w-6' : 'h-9 w-9')}>
          <Copy className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {
          onCopyToDay(task, tomorrow);
          toast.success(`Copied to ${format(tomorrow, 'EEEE')}`);
        }}>
          Copy to tomorrow
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Copy to another day</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {days.map((d, i) => (
              <DropdownMenuItem key={i} onClick={() => {
                onCopyToDay(task, d);
                toast.success(`Copied to ${format(d, 'EEEE')}`);
              }}>
                {format(d, 'EEE, MMM d')}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={() => {
          onCopyToNextWeek(task);
          toast.success(`Duplicated to next week's ${format(date, 'EEEE')}`);
        }}>
          Duplicate to next week
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
