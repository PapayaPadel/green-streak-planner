import React, { createContext, useContext } from 'react';
import { useWeekTasks } from '@/hooks/useWeekTasks';
import { useHabits } from '@/hooks/useHabits';

type WeekTasksContextType = ReturnType<typeof useWeekTasks>;
type HabitsContextType = ReturnType<typeof useHabits>;

const WeekTasksContext = createContext<WeekTasksContextType | null>(null);
const HabitsContext = createContext<HabitsContextType | null>(null);

export function WeekTasksProvider({ weekStart, children }: { weekStart: Date; children: React.ReactNode }) {
  const value = useWeekTasks(weekStart);
  return <WeekTasksContext.Provider value={value}>{children}</WeekTasksContext.Provider>;
}

export function HabitsProvider({ weekStart, children }: { weekStart: Date; children: React.ReactNode }) {
  const value = useHabits(weekStart);
  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useWeekTasksContext(): WeekTasksContextType {
  const ctx = useContext(WeekTasksContext);
  if (!ctx) throw new Error('useWeekTasksContext must be used inside WeekTasksProvider');
  return ctx;
}

export function useHabitsContext(): HabitsContextType {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabitsContext must be used inside HabitsProvider');
  return ctx;
}
