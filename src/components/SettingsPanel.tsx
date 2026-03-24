import { X, Sun, Moon, Check, Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { ColorScheme, useSettings } from '@/hooks/useSettings';
import { useWeekTasksContext, useHabitsContext } from '@/contexts/TrackerContext';
import { ALL_SHORT_DAY_NAMES } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getLastSavedTime } from '@/components/SaveIndicator';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  weekStart: Date;
}

const COLOR_OPTIONS: { value: ColorScheme; label: string; color: string }[] = [
  { value: 'green', label: 'Green', color: 'bg-[hsl(123,43%,34%)]' },
  { value: 'blue', label: 'Blue', color: 'bg-[hsl(213,94%,32%)]' },
  { value: 'purple', label: 'Purple', color: 'bg-[hsl(271,55%,35%)]' },
  { value: 'orange', label: 'Orange', color: 'bg-[hsl(24,95%,38%)]' },
];

function exportData() {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('tasks-') || key.startsWith('habits') || key.startsWith('habit-completions-') || key.startsWith('habit-schedules') || key.startsWith('recurring-tasks') || key === 'tracker-settings')) {
      try { data[key] = JSON.parse(localStorage.getItem(key)!); } catch { data[key] = localStorage.getItem(key); }
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `streak-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Data exported successfully');
}

function importData(file: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      if (typeof data !== 'object' || data === null) throw new Error('Invalid format');
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
      toast.success('Data imported successfully. Reloading…');
      setTimeout(() => window.location.reload(), 800);
    } catch { toast.error('Failed to import: invalid file format'); }
  };
  reader.readAsText(file);
}

export function SettingsPanel({ isOpen, onClose, weekStart }: SettingsPanelProps) {
  const { colorScheme, themeMode, setColorScheme, toggleTheme } = useSettings();
  const { recurringDefs, deleteRecurringDef, clearWeekData } = useWeekTasksContext();
  const { clearWeekHabits } = useHabitsContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lastSaved, setLastSaved] = useState<string | null>(() => getLastSavedTime());

  useEffect(() => {
    const handler = () => setLastSaved(new Date().toISOString());
    window.addEventListener('localStorage-save', handler);
    return () => window.removeEventListener('localStorage-save', handler);
  }, []);

  if (!isOpen) return null;

  const handleClearWeek = () => {
    clearWeekData();
    clearWeekHabits();
    toast.success('Current week data cleared');
  };

  return (
    <>
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-xl z-50 animate-slide-in overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-lg">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme Mode */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-foreground">Theme Mode</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {themeMode === 'light' ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-primary" />}
                <span className="text-sm">{themeMode === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
              <Switch checked={themeMode === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </div>

          {/* Color Scheme */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-foreground">Accent Color</h3>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button key={option.value} onClick={() => setColorScheme(option.value)}
                  className={cn('flex items-center gap-2 p-3 rounded-lg border-2 transition-all',
                    colorScheme === option.value ? 'border-ring bg-accent' : 'border-border hover:border-muted-foreground/50'
                  )}>
                  <div className={cn('w-5 h-5 rounded-full', option.color)} />
                  <span className="text-sm">{option.label}</span>
                  {colorScheme === option.value && <Check className="h-4 w-4 ml-auto text-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-foreground">Backup & Restore</h3>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={exportData}>
                <Download className="h-4 w-4" />Export
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />Import
              </Button>
              <input ref={fileInputRef} type="file" accept=".json" className="hidden"
                onChange={(e) => { const file = e.target.files?.[0]; if (file) importData(file); e.target.value = ''; }} />
            </div>
            <p className="text-xs text-muted-foreground">Export downloads a JSON backup. Import restores from a previous backup.</p>
          </div>

          {/* Clear Current Week */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-foreground">Clear Current Week</h3>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                  <AlertTriangle className="h-4 w-4" />Clear Week Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear current week?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all tasks and habit completions for the week of {format(weekStart, 'MMM d, yyyy')}. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearWeek} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Clear Week
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Manage Recurring Tasks */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-foreground">Recurring Tasks</h3>
            {recurringDefs.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No recurring tasks defined</p>
            ) : (
              <div className="space-y-2">
                {recurringDefs.map(def => (
                  <div key={def.id} className="flex items-start justify-between p-2 bg-muted/50 rounded-lg gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{def.text}</p>
                      <div className="flex gap-1 mt-1">
                        {SHORT_DAY_NAMES.map((day, i) => (
                          <span key={i} className={cn('text-[10px] px-1.5 py-0.5 rounded',
                            def.days.includes(i) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          )}>{day}</span>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { deleteRecurringDef(def.id); toast.success('Recurring task removed'); }}
                      className="h-7 w-7 text-destructive shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info + Last Saved */}
          <div className="pt-4 border-t border-border space-y-2">
            <p className="text-xs text-muted-foreground">
              All data is stored locally in your browser. Clear browser data to reset.
            </p>
            <p className="text-xs text-muted-foreground/70">
              {lastSaved ? `Last saved: ${format(new Date(lastSaved), 'MMM d, h:mm:ss a')}` : 'No saves yet'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
