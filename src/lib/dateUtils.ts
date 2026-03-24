import { startOfWeek, endOfWeek, format, addDays, isSameDay, addWeeks, subWeeks, parseISO } from 'date-fns';

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export const SHORT_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
export const ALL_DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const ALL_SHORT_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 }); // Sunday
}

export function getWeekKey(weekStart: Date): string {
  return format(weekStart, 'yyyy-MM-dd');
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = getWeekEnd(weekStart);
  return `${format(weekStart, 'MMMM dd')} – ${format(weekEnd, 'MMMM dd, yyyy')}`;
}

export function getDaysOfWeek(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function goToNextWeek(weekStart: Date): Date {
  return addWeeks(weekStart, 1);
}

export function goToPreviousWeek(weekStart: Date): Date {
  return subWeeks(weekStart, 1);
}

export function parseWeekKey(key: string): Date {
  return parseISO(key);
}
