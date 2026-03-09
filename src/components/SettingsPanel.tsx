import { X, Sun, Moon, Check } from 'lucide-react';
import { ColorScheme, useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_OPTIONS: { value: ColorScheme; label: string; color: string }[] = [
  { value: 'green', label: 'Green', color: 'bg-[hsl(123,43%,34%)]' },
  { value: 'blue', label: 'Blue', color: 'bg-[hsl(213,94%,32%)]' },
  { value: 'purple', label: 'Purple', color: 'bg-[hsl(271,55%,35%)]' },
  { value: 'orange', label: 'Orange', color: 'bg-[hsl(24,95%,38%)]' },
];

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { colorScheme, themeMode, setColorScheme, toggleTheme } = useSettings();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-xl z-50 animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-lg">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme Mode */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-foreground">Theme Mode</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {themeMode === 'light' ? (
                  <Sun className="h-4 w-4 text-warning" />
                ) : (
                  <Moon className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm">{themeMode === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
              <Switch
                checked={themeMode === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </div>

          {/* Color Scheme */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-foreground">Accent Color</h3>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setColorScheme(option.value)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border-2 transition-all',
                    colorScheme === option.value
                      ? 'border-ring bg-accent'
                      : 'border-border hover:border-muted-foreground/50'
                  )}
                >
                  <div className={cn('w-5 h-5 rounded-full', option.color)} />
                  <span className="text-sm">{option.label}</span>
                  {colorScheme === option.value && (
                    <Check className="h-4 w-4 ml-auto text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              All data is stored locally in your browser. Clear browser data to reset.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
