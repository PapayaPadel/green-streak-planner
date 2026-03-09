import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DISMISSED_KEY = 'export-reminder-dismissed';

function isSundayEvening(): boolean {
  const now = new Date();
  return now.getDay() === 0 && now.getHours() >= 17;
}

function getWeekId(): string {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNum}`;
}

function exportData() {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('tasks-') || key.startsWith('habits') || key.startsWith('habit-completions-') || key === 'tracker-settings')) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key)!);
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `streak-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function WeeklyExportReminder() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isSundayEvening()) {
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (dismissed !== getWeekId()) {
        setVisible(true);
      }
    }
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, getWeekId());
    setVisible(false);
  }

  function handleExport() {
    exportData();
    dismiss();
  }

  if (!visible) return null;

  return (
    <div className="bg-accent text-accent-foreground px-4 py-2.5 flex items-center justify-between gap-3 text-sm animate-in slide-in-from-top-2 duration-300">
      <span className="font-medium">Don't forget to export your data this week</span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" className="gap-1.5 h-7 text-xs" onClick={handleExport}>
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
        <button onClick={dismiss} className="text-accent-foreground/60 hover:text-accent-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
