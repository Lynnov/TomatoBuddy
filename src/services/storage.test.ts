import { beforeEach, describe, expect, it } from 'vitest';
import { loadAppStorage, saveAppStorage } from './storage';
import { createInitialTimer } from '../domain/timer';
import { defaultSettings } from '../domain/presets';
import { createDailyStats } from '../domain/stats';

describe('storage service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when localStorage is empty', () => {
    const today = '2026-05-11';
    const data = loadAppStorage(today);

    expect(data.settings).toEqual(defaultSettings);
    expect(data.timer).toEqual(createInitialTimer());
    expect(data.stats).toEqual(createDailyStats(today));
    expect(data.ui.windowMode).toBe('full');
  });

  it('saves and loads app storage', () => {
    const today = '2026-05-11';
    const data = {
      settings: { ...defaultSettings, focusMinutes: 50, breakMinutes: 10, preset: 'deep' as const },
      timer: createInitialTimer(50, 10),
      stats: createDailyStats(today),
      ui: { windowMode: 'mini' as const, windowPosition: { x: 10, y: 20 } },
    };

    saveAppStorage(data);

    expect(loadAppStorage(today)).toEqual(data);
  });
});
