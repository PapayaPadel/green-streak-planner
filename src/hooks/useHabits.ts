import { useState, useCallback, useEffect } from 'react';
import { getWeekKey, getDaysOfWeek } from '@/lib/dateUtils';

export interface Habit {
  id: string;
  name: string;
}

export type HabitStatus = 'clear' | 'done' | 'missed';

export interface HabitCompletions {
  [habitId: string]: {
    [dayIndex: number]: HabitStatus;
  };
}

export interface HabitSchedules {
  [habitId: string]: number[]; // scheduled day indices 0-6
}

const HABITS_KEY = 'habits';
const SCHEDULES_KEY = 'habit-schedules';

function getCompletionsKey(weekKey: string): string {
  return `habit-completions-${weekKey}`;
}

function loadHabits(): Habit[] {
  const stored = localStorage.getItem(HABITS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveHabits(habits: Habit[]): void {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  import('@/components/SaveIndicator').then(m => m.emitSave());
}

function loadCompletions(weekKey: string): HabitCompletions {
  const stored = localStorage.getItem(getCompletionsKey(weekKey));
  return stored ? JSON.parse(stored) : {};
}

function saveCompletions(weekKey: string, completions: HabitCompletions): void {
  localStorage.setItem(getCompletionsKey(weekKey), JSON.stringify(completions));
  import('@/components/SaveIndicator').then(m => m.emitSave());
}

function loadSchedules(): HabitSchedules {
  const stored = localStorage.getItem(SCHEDULES_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveSchedules(schedules: HabitSchedules): void {
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  import('@/components/SaveIndicator').then(m => m.emitSave());
}

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export function useHabits(weekStart: Date) {
  const weekKey = getWeekKey(weekStart);
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [completions, setCompletions] = useState<HabitCompletions>(() => loadCompletions(weekKey));
  const [schedules, setSchedulesState] = useState<HabitSchedules>(() => loadSchedules());

  useEffect(() => {
    setCompletions(loadCompletions(weekKey));
  }, [weekKey]);

  const getHabitSchedule = useCallback((habitId: string): number[] => {
    return schedules[habitId] || ALL_DAYS;
  }, [schedules]);

  const setHabitSchedule = useCallback((habitId: string, days: number[]) => {
    const newSchedules = { ...schedules, [habitId]: days.sort() };
    setSchedulesState(newSchedules);
    saveSchedules(newSchedules);
  }, [schedules]);

  const isHabitScheduledForDay = useCallback((habitId: string, dayIndex: number): boolean => {
    const schedule = schedules[habitId] || ALL_DAYS;
    return schedule.includes(dayIndex);
  }, [schedules]);

  const addHabit = useCallback((name: string) => {
    const newHabit: Habit = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
    };
    const newHabits = [...habits, newHabit];
    setHabits(newHabits);
    saveHabits(newHabits);
  }, [habits]);

  const updateHabit = useCallback((habitId: string, newName: string) => {
    const newHabits = habits.map(h => h.id === habitId ? { ...h, name: newName } : h);
    setHabits(newHabits);
    saveHabits(newHabits);
  }, [habits]);

  const deleteHabit = useCallback((habitId: string) => {
    const newHabits = habits.filter(h => h.id !== habitId);
    setHabits(newHabits);
    saveHabits(newHabits);
    const newCompletions = { ...completions };
    delete newCompletions[habitId];
    setCompletions(newCompletions);
    saveCompletions(weekKey, newCompletions);
    const newSchedules = { ...schedules };
    delete newSchedules[habitId];
    setSchedulesState(newSchedules);
    saveSchedules(newSchedules);
  }, [habits, completions, weekKey, schedules]);

  const cycleHabitStatus = useCallback((habitId: string, dayIndex: number) => {
    const currentStatus = completions[habitId]?.[dayIndex] || 'clear';
    let newStatus: HabitStatus;
    if (currentStatus === 'clear') newStatus = 'done';
    else if (currentStatus === 'done') newStatus = 'missed';
    else newStatus = 'clear';

    const newCompletions: HabitCompletions = {
      ...completions,
      [habitId]: { ...(completions[habitId] || {}), [dayIndex]: newStatus },
    };
    setCompletions(newCompletions);
    saveCompletions(weekKey, newCompletions);
  }, [completions, weekKey]);

  const getHabitStatus = useCallback((habitId: string, dayIndex: number): HabitStatus => {
    return completions[habitId]?.[dayIndex] || 'clear';
  }, [completions]);

  const getDayHabitStats = useCallback((dayIndex: number) => {
    let total = 0;
    let completed = 0;
    habits.forEach(habit => {
      const schedule = schedules[habit.id] || ALL_DAYS;
      if (schedule.includes(dayIndex)) {
        total++;
        if (completions[habit.id]?.[dayIndex] === 'done') completed++;
      }
    });
    return { total, completed };
  }, [habits, completions, schedules]);

  const getHabitWeeklyRate = useCallback((habitId: string) => {
    const schedule = schedules[habitId] || ALL_DAYS;
    if (schedule.length === 0) return 0;
    let completed = 0;
    schedule.forEach(dayIndex => {
      if (completions[habitId]?.[dayIndex] === 'done') completed++;
    });
    return Math.round((completed / schedule.length) * 100);
  }, [completions, schedules]);

  const calculateStreak = useCallback((habitId: string): number => {
    const today = new Date();
    const days = getDaysOfWeek(weekStart);
    const schedule = schedules[habitId] || ALL_DAYS;
    let streak = 0;

    const todayIndex = days.findIndex(d => d.toDateString() === today.toDateString());
    if (todayIndex === -1) return 0;

    for (let i = todayIndex; i >= 0; i--) {
      if (!schedule.includes(i)) continue;
      if (completions[habitId]?.[i] === 'done') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [completions, weekStart, schedules]);

  const clearWeekHabits = useCallback(() => {
    const empty: HabitCompletions = {};
    setCompletions(empty);
    saveCompletions(weekKey, empty);
  }, [weekKey]);

  return {
    habits, addHabit, updateHabit, deleteHabit,
    cycleHabitStatus, getHabitStatus,
    getDayHabitStats, getHabitWeeklyRate, calculateStreak,
    getHabitSchedule, setHabitSchedule, isHabitScheduledForDay,
    clearWeekHabits,
  };
}
