import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const SAVE_EVENT = 'localStorage-save';

export function emitSave() {
  localStorage.setItem('last-saved-at', new Date().toISOString());
  window.dispatchEvent(new Event(SAVE_EVENT));
}

export function getLastSavedTime(): string | null {
  return localStorage.getItem('last-saved-at');
}

export function SaveIndicator() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      setVisible(true);
      setTimeout(() => setVisible(false), 1200);
    };
    window.addEventListener(SAVE_EVENT, handler);
    return () => window.removeEventListener(SAVE_EVENT, handler);
  }, []);

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-lg transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      )}
    >
      <Check className="w-3.5 h-3.5" />
      Saved
    </div>
  );
}
