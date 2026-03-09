import { useState, useCallback, useEffect } from 'react';
import { getWeekKey, getDaysOfWeek } from '@/lib/dateUtils';

export interface Habit {
  id: string;
  name: string;
}

export type HabitStatus = 'clear' | 'done' | 'missed';

export interface HabitCompletions {
  [habitId: string]: {
    [dayIndex: number]: HabitStatus; // dayIndex 0-6 (Mon-Sun)
  };
}

const HABITS_KEY = 'habits';

function getCompletionsKey(weekKey: string): string {
  return `habit-completions-${weekKey}`;
}

function loadHabits(): Habit[] {
  const stored = localStorage.getItem(HABITS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveHabits(habits: Habit[]): void {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

function loadCompletions(weekKey: string): HabitCompletions {
  const stored = localStorage.getItem(getCompletionsKey(weekKey));
  return stored ? JSON.parse(stored) : {};
}

function saveCompletions(weekKey: string, completions: HabitCompletions): void {
  localStorage.setItem(getCompletionsKey(weekKey), JSON.stringify(completions));
}

export function useHabits(weekStart: Date) {
  const weekKey = getWeekKey(weekStart);
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [completions, setCompletions] = useState<HabitCompletions>(() => loadCompletions(weekKey));

  useEffect(() => {
    setCompletions(loadCompletions(weekKey));
  }, [weekKey]);

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

    // Also clear completions for this habit
    const newCompletions = { ...completions };
    delete newCompletions[habitId];
    setCompletions(newCompletions);
    saveCompletions(weekKey, newCompletions);
  }, [habits, completions, weekKey]);

  const cycleHabitStatus = useCallback((habitId: string, dayIndex: number) => {
    const currentStatus = completions[habitId]?.[dayIndex] || 'clear';
    let newStatus: HabitStatus;
    if (currentStatus === 'clear') newStatus = 'done';
    else if (currentStatus === 'done') newStatus = 'missed';
    else newStatus = 'clear';

    const newCompletions: HabitCompletions = {
      ...completions,
      [habitId]: {
        ...(completions[habitId] || {}),
        [dayIndex]: newStatus,
      },
    };
    setCompletions(newCompletions);
    saveCompletions(weekKey, newCompletions);
  }, [completions, weekKey]);

  const getHabitStatus = useCallback((habitId: string, dayIndex: number): HabitStatus => {
    return completions[habitId]?.[dayIndex] || 'clear';
  }, [completions]);

  const getDayHabitStats = useCallback((dayIndex: number) => {
    let total = habits.length;
    let completed = 0;
    habits.forEach(habit => {
      if (completions[habit.id]?.[dayIndex] === 'done') {
        completed++;
      }
    });
    return { total, completed };
  }, [habits, completions]);

  const getHabitWeeklyRate = useCallback((habitId: string) => {
    let completed = 0;
    for (let i = 0; i < 7; i++) {
      if (completions[habitId]?.[i] === 'done') {
        completed++;
      }
    }
    return Math.round((completed / 7) * 100);
  }, [completions]);

  const calculateStreak = useCallback((habitId: string): number => {
    const today = new Date();
    const days = getDaysOfWeek(weekStart);
    let streak = 0;
    
    // Find today's index in the week
    const todayIndex = days.findIndex(d => 
      d.toDateString() === today.toDateString()
    );
    
    if (todayIndex === -1) return 0;
    
    // Count backwards from today
    for (let i = todayIndex; i >= 0; i--) {
      if (completions[habitId]?.[i] === 'done') {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [completions, weekStart]);

  return {
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    cycleHabitStatus,
    getHabitStatus,
    getDayHabitStats,
    getHabitWeeklyRate,
    calculateStreak,
  };
}
