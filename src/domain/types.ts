export type TimerMode = 'idle' | 'focus' | 'paused' | 'focusComplete' | 'break' | 'breakComplete';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';
export type PresetKey = 'short' | 'standard' | 'deep' | 'custom';
export type WindowMode = 'full' | 'mini';

export interface TimerState {
  mode: TimerMode;
  previousMode: 'focus' | 'break' | null;
  status: TimerStatus;
  focusMinutes: number;
  breakMinutes: number;
  durationSeconds: number;
  remainingSeconds: number;
  startedAt: number | null;
}

export interface UserSettings {
  focusMinutes: number;
  breakMinutes: number;
  preset: PresetKey;
  soundEnabled: boolean;
  alwaysOnTop: boolean;
  restoreSession: boolean;
  defaultMiniMode: boolean;
}

export interface DailyStats {
  date: string;
  completedPomodoros: number;
  focusSeconds: number;
  fishCount: number;
}

export interface UiState {
  windowMode: WindowMode;
  windowPosition: { x: number; y: number } | null;
}
