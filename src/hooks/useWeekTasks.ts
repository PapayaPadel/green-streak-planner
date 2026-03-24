import { useState, useCallback, useEffect } from 'react';
import { format, addDays, addWeeks } from 'date-fns';
import { getWeekKey } from '@/lib/dateUtils';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  recurringId?: string;
}

export type DayTasks = Task[];

export interface WeekTasks {
  [dayKey: string]: DayTasks;
}

export interface RecurringTaskDef {
  id: string;
  text: string;
  days: number[]; // 0=Mon..6=Sun
}

const RECURRING_KEY = 'recurring-tasks';

function getStorageKey(weekKey: string): string {
  return `tasks-${weekKey}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function loadWeekTasks(weekKey: string): WeekTasks {
  const stored = localStorage.getItem(getStorageKey(weekKey));
  return stored ? JSON.parse(stored) : {};
}

function saveWeekTasks(weekKey: string, tasks: WeekTasks): void {
  localStorage.setItem(getStorageKey(weekKey), JSON.stringify(tasks));
  import('@/components/SaveIndicator').then(m => m.emitSave());
}

function loadRecurringDefs(): RecurringTaskDef[] {
  const stored = localStorage.getItem(RECURRING_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveRecurringDefs(defs: RecurringTaskDef[]): void {
  localStorage.setItem(RECURRING_KEY, JSON.stringify(defs));
  import('@/components/SaveIndicator').then(m => m.emitSave());
}

function populateRecurring(weekTasks: WeekTasks, weekStart: Date, defs: RecurringTaskDef[]): WeekTasks {
  const result = { ...weekTasks };
  defs.forEach(def => {
    def.days.forEach(dayIndex => {
      const dayKey = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
      const dayTasks = result[dayKey] || [];
      const exists = dayTasks.some(t => t.recurringId === def.id);
      if (!exists) {
        result[dayKey] = [...dayTasks, { id: generateId(), text: def.text, completed: false, recurringId: def.id }];
      }
    });
  });
  return result;
}

export function useWeekTasks(weekStart: Date) {
  const weekKey = getWeekKey(weekStart);
  const [recurringDefs, setRecurringDefs] = useState<RecurringTaskDef[]>(() => loadRecurringDefs());
  const [tasks, setTasks] = useState<WeekTasks>(() => {
    const loaded = loadWeekTasks(weekKey);
    return populateRecurring(loaded, weekStart, loadRecurringDefs());
  });

  useEffect(() => {
    const defs = loadRecurringDefs();
    setRecurringDefs(defs);
    const loaded = loadWeekTasks(weekKey);
    const populated = populateRecurring(loaded, weekStart, defs);
    setTasks(populated);
    if (JSON.stringify(loaded) !== JSON.stringify(populated)) {
      saveWeekTasks(weekKey, populated);
    }
  }, [weekKey]);

  const getDayKey = useCallback((date: Date): string => format(date, 'yyyy-MM-dd'), []);

  const getDayTasks = useCallback((date: Date): DayTasks => {
    return tasks[getDayKey(date)] || [];
  }, [tasks, getDayKey]);

  const addTask = useCallback((date: Date, text: string) => {
    const dayKey = getDayKey(date);
    const newTask: Task = { id: generateId(), text, completed: false };
    const newTasks = { ...tasks, [dayKey]: [...(tasks[dayKey] || []), newTask] };
    setTasks(newTasks);
    saveWeekTasks(weekKey, newTasks);
  }, [tasks, weekKey, getDayKey]);

  const toggleTask = useCallback((date: Date, taskId: string) => {
    const dayKey = getDayKey(date);
    const newDayTasks = (tasks[dayKey] || []).map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    const newTasks = { ...tasks, [dayKey]: newDayTasks };
    setTasks(newTasks);
    saveWeekTasks(weekKey, newTasks);
  }, [tasks, weekKey, getDayKey]);

  const updateTask = useCallback((date: Date, taskId: string, newText: string) => {
    const dayKey = getDayKey(date);
    const newDayTasks = (tasks[dayKey] || []).map(task =>
      task.id === taskId ? { ...task, text: newText } : task
    );
    const newTasks = { ...tasks, [dayKey]: newDayTasks };
    setTasks(newTasks);
    saveWeekTasks(weekKey, newTasks);
  }, [tasks, weekKey, getDayKey]);

  const deleteTask = useCallback((date: Date, taskId: string) => {
    const dayKey = getDayKey(date);
    const newDayTasks = (tasks[dayKey] || []).filter(task => task.id !== taskId);
    const newTasks = { ...tasks, [dayKey]: newDayTasks };
    setTasks(newTasks);
    saveWeekTasks(weekKey, newTasks);
  }, [tasks, weekKey, getDayKey]);

  const getWeekStats = useCallback(() => {
    // Only count Mon-Fri (first 5 days)
    const weekDays = getDaysOfWeek(weekStart);
    let totalTasks = 0;
    let completedTasks = 0;
    weekDays.forEach(date => {
      const dayKey = getDayKey(date);
      const dayTasks = tasks[dayKey] || [];
      totalTasks += dayTasks.length;
      completedTasks += dayTasks.filter(t => t.completed).length;
    });
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalTasks, completedTasks, percentage };
  }, [tasks, weekStart, getDayKey]);

  const getDayStats = useCallback((date: Date) => {
    const dayTasks = getDayTasks(date);
    const total = dayTasks.length;
    const completed = dayTasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [getDayTasks]);

  const getRecurringDefForTask = useCallback((task: Task): RecurringTaskDef | undefined => {
    if (!task.recurringId) return undefined;
    return recurringDefs.find(d => d.id === task.recurringId);
  }, [recurringDefs]);

  const setTaskRecurrence = useCallback((date: Date, taskId: string, selectedDays: number[]) => {
    const dayKey = getDayKey(date);
    const task = (tasks[dayKey] || []).find(t => t.id === taskId);
    if (!task) return;

    let newDefs = [...recurringDefs];
    let newTasks = { ...tasks };

    if (task.recurringId) {
      if (selectedDays.length === 0) {
        newDefs = newDefs.filter(d => d.id !== task.recurringId);
        newTasks[dayKey] = newTasks[dayKey].map(t =>
          t.id === taskId ? { ...t, recurringId: undefined } : t
        );
      } else {
        newDefs = newDefs.map(d =>
          d.id === task.recurringId ? { ...d, text: task.text, days: selectedDays } : d
        );
      }
    } else if (selectedDays.length > 0) {
      const defId = generateId();
      newDefs.push({ id: defId, text: task.text, days: selectedDays });
      newTasks[dayKey] = newTasks[dayKey].map(t =>
        t.id === taskId ? { ...t, recurringId: defId } : t
      );
      newTasks = populateRecurring(newTasks, weekStart, [{ id: defId, text: task.text, days: selectedDays }]);
    }

    setRecurringDefs(newDefs);
    saveRecurringDefs(newDefs);
    setTasks(newTasks);
    saveWeekTasks(weekKey, newTasks);
  }, [tasks, recurringDefs, weekStart, weekKey, getDayKey]);

  const copyTaskToDay = useCallback((task: Task, targetDate: Date) => {
    const dayKey = getDayKey(targetDate);
    const newTask: Task = { id: generateId(), text: task.text, completed: false };
    const newTasks = { ...tasks, [dayKey]: [...(tasks[dayKey] || []), newTask] };
    setTasks(newTasks);
    saveWeekTasks(weekKey, newTasks);
  }, [tasks, weekKey, getDayKey]);

  const copyTaskToNextWeek = useCallback((task: Task, currentDate: Date) => {
    const nextWeekStart = addWeeks(weekStart, 1);
    const nextWeekKey = getWeekKey(nextWeekStart);
    const dayOffset = Math.round((currentDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    const targetDate = addDays(nextWeekStart, dayOffset);
    const targetDayKey = format(targetDate, 'yyyy-MM-dd');
    const nextWeekTasks = loadWeekTasks(nextWeekKey);
    const newTask: Task = { id: generateId(), text: task.text, completed: false };
    nextWeekTasks[targetDayKey] = [...(nextWeekTasks[targetDayKey] || []), newTask];
    saveWeekTasks(nextWeekKey, nextWeekTasks);
  }, [weekStart]);

  const clearWeekData = useCallback(() => {
    const empty: WeekTasks = {};
    setTasks(empty);
    saveWeekTasks(weekKey, empty);
  }, [weekKey]);

  const deleteRecurringDef = useCallback((defId: string) => {
    const newDefs = recurringDefs.filter(d => d.id !== defId);
    setRecurringDefs(newDefs);
    saveRecurringDefs(newDefs);
  }, [recurringDefs]);

  const updateRecurringDef = useCallback((defId: string, text: string, days: number[]) => {
    const newDefs = days.length === 0
      ? recurringDefs.filter(d => d.id !== defId)
      : recurringDefs.map(d => d.id === defId ? { ...d, text, days } : d);
    setRecurringDefs(newDefs);
    saveRecurringDefs(newDefs);
  }, [recurringDefs]);

  return {
    getDayTasks, addTask, toggleTask, updateTask, deleteTask,
    getWeekStats, getDayStats,
    recurringDefs, getRecurringDefForTask, setTaskRecurrence,
    copyTaskToDay, copyTaskToNextWeek,
    clearWeekData, deleteRecurringDef, updateRecurringDef,
  };
}
