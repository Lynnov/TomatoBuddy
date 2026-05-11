import { defaultSettings } from '../domain/presets';
import { createDailyStats, ensureTodayStats } from '../domain/stats';
import { createInitialTimer } from '../domain/timer';
import type { DailyStats, TimerState, UiState, UserSettings } from '../domain/types';

const STORAGE_KEY = 'tomato-buddy:v1';

export interface AppStorageData {
  settings: UserSettings;
  timer: TimerState;
  stats: DailyStats;
  ui: UiState;
}

export function loadAppStorage(today: string): AppStorageData {
  const fallback: AppStorageData = {
    settings: defaultSettings,
    timer: createInitialTimer(),
    stats: createDailyStats(today),
    ui: { windowMode: 'full', windowPosition: null },
  };

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as Partial<AppStorageData>;
    const settings = { ...defaultSettings, ...parsed.settings };
    return {
      settings,
      timer: parsed.timer ?? createInitialTimer(settings.focusMinutes, settings.breakMinutes),
      stats: ensureTodayStats(parsed.stats ?? null, today),
      ui: parsed.ui ?? fallback.ui,
    };
  } catch {
    return fallback;
  }
}

export function saveAppStorage(data: AppStorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
