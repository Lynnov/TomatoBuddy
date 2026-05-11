import type { DailyStats } from './types';

export function createDailyStats(date: string): DailyStats {
  return { date, completedPomodoros: 0, focusSeconds: 0, fishCount: 0 };
}

export function addCompletedFocus(stats: DailyStats, focusSeconds: number): DailyStats {
  return {
    ...stats,
    completedPomodoros: stats.completedPomodoros + 1,
    focusSeconds: stats.focusSeconds + focusSeconds,
    fishCount: stats.fishCount + 1,
  };
}

export function ensureTodayStats(stats: DailyStats | null, today: string): DailyStats {
  if (!stats || stats.date !== today) return createDailyStats(today);
  return stats;
}

export function formatFocusTotal(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  if (hours === 0) return `${restMinutes} 分钟`;
  if (restMinutes === 0) return `${hours} 小时`;
  return `${hours} 小时 ${restMinutes} 分钟`;
}
