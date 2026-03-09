import { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { getWeekKey } from '@/lib/dateUtils';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export type DayTasks = Task[];

export interface WeekTasks {
  [dayKey: string]: DayTasks; // dayKey is 'YYYY-MM-DD'
}

function getStorageKey(weekKey: string): string {
  return `tasks-${weekKey}`;
}

function loadWeekTasks(weekKey: string): WeekTasks {
  const stored = localStorage.getItem(getStorageKey(weekKey));
  return stored ? JSON.parse(stored) : {};
}

function saveWeekTasks(weekKey: string, tasks: WeekTasks): void {
  localStorage.setItem(getStorageKey(weekKey), JSON.stringify(tasks));
  import('@/components/SaveIndicator').then(m => m.emitSave());
}

export function useWeekTasks(weekStart: Date) {
  const weekKey = getWeekKey(weekStart);
  const [tasks, setTasks] = useState<WeekTasks>(() => loadWeekTasks(weekKey));

  useEffect(() => {
    setTasks(loadWeekTasks(weekKey));
  }, [weekKey]);

  const getDayKey = useCallback((date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  }, []);

  const getDayTasks = useCallback((date: Date): DayTasks => {
    const dayKey = getDayKey(date);
    return tasks[dayKey] || [];
  }, [tasks, getDayKey]);

  const addTask = useCallback((date: Date, text: string) => {
    const dayKey = getDayKey(date);
    const newTask: Task = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      completed: false,
    };
    const newTasks = {
      ...tasks,
      [dayKey]: [...(tasks[dayKey] || []), newTask],
    };
    setTasks(newTasks);
    saveWeekTasks(weekKey, newTasks);
  }, [tasks, weekKey, getDayKey]);

  const toggleTask = useCallback((date: Date, taskId: string) => {
    const dayKey = getDayKey(date);
    const dayTasks = tasks[dayKey] || [];
    const newDayTasks = dayTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    const newTasks = { ...tasks, [dayKey]: newDayTasks };
    setTasks(newTasks);
    saveWeekTasks(weekKey, newTasks);
  }, [tasks, weekKey, getDayKey]);

  const updateTask = useCallback((date: Date, taskId: string, newText: string) => {
    const dayKey = getDayKey(date);
    const dayTasks = tasks[dayKey] || [];
    const newDayTasks = dayTasks.map(task =>
      task.id === taskId ? { ...task, text: newText } : task
    );
    const newTasks = { ...tasks, [dayKey]: newDayTasks };
    setTasks(newTasks);
    saveWeekTasks(weekKey, newTasks);
  }, [tasks, weekKey, getDayKey]);

  const deleteTask = useCallback((date: Date, taskId: string) => {
    const dayKey = getDayKey(date);
    const dayTasks = tasks[dayKey] || [];
    const newDayTasks = dayTasks.filter(task => task.id !== taskId);
    const newTasks = { ...tasks, [dayKey]: newDayTasks };
    setTasks(newTasks);
    saveWeekTasks(weekKey, newTasks);
  }, [tasks, weekKey, getDayKey]);

  const getWeekStats = useCallback(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    Object.values(tasks).forEach(dayTasks => {
      totalTasks += dayTasks.length;
      completedTasks += dayTasks.filter(t => t.completed).length;
    });
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalTasks, completedTasks, percentage };
  }, [tasks]);

  const getDayStats = useCallback((date: Date) => {
    const dayTasks = getDayTasks(date);
    const total = dayTasks.length;
    const completed = dayTasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [getDayTasks]);

  return {
    getDayTasks,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    getWeekStats,
    getDayStats,
  };
}
