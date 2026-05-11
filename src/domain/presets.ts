import type { PresetKey, UserSettings } from './types';

export const PRESETS: Record<Exclude<PresetKey, 'custom'>, { label: string; focusMinutes: number; breakMinutes: number }> = {
  short: { label: '短专注', focusMinutes: 15, breakMinutes: 3 },
  standard: { label: '标准番茄', focusMinutes: 25, breakMinutes: 5 },
  deep: { label: '深度专注', focusMinutes: 50, breakMinutes: 10 },
};

export const defaultSettings: UserSettings = {
  focusMinutes: 25,
  breakMinutes: 5,
  preset: 'standard',
  soundEnabled: true,
  alwaysOnTop: true,
  restoreSession: true,
  defaultMiniMode: false,
};
