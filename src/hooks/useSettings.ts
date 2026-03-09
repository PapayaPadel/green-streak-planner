import { useState, useCallback, useEffect } from 'react';

export type ColorScheme = 'green' | 'blue' | 'purple' | 'orange';
export type ThemeMode = 'light' | 'dark';

interface Settings {
  colorScheme: ColorScheme;
  themeMode: ThemeMode;
}

const SETTINGS_KEY = 'tracker-settings';

function loadSettings(): Settings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  return stored ? JSON.parse(stored) : { colorScheme: 'green', themeMode: 'light' };
}

function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  import('@/components/SaveIndicator').then(m => m.emitSave());
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  const applySettings = useCallback((s: Settings) => {
    // Apply theme mode
    document.documentElement.classList.toggle('dark', s.themeMode === 'dark');
    
    // Apply color scheme
    document.documentElement.setAttribute('data-scheme', s.colorScheme);
  }, []);

  useEffect(() => {
    applySettings(settings);
  }, [settings, applySettings]);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    const newSettings = { ...settings, colorScheme: scheme };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    const newSettings = { ...settings, themeMode: mode };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings]);

  const toggleTheme = useCallback(() => {
    const newMode = settings.themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  }, [settings.themeMode, setThemeMode]);

  return {
    colorScheme: settings.colorScheme,
    themeMode: settings.themeMode,
    setColorScheme,
    setThemeMode,
    toggleTheme,
  };
}
