import { describe, expect, it } from 'vitest';
import { createDailyStats, addCompletedFocus, ensureTodayStats } from './stats';

describe('daily stats', () => {
  it('creates empty stats for a date', () => {
    expect(createDailyStats('2026-05-11')).toEqual({
      date: '2026-05-11',
      completedPomodoros: 0,
      focusSeconds: 0,
      fishCount: 0,
    });
  });

  it('adds completed focus and fish reward', () => {
    const next = addCompletedFocus(createDailyStats('2026-05-11'), 1500);

    expect(next.completedPomodoros).toBe(1);
    expect(next.focusSeconds).toBe(1500);
    expect(next.fishCount).toBe(1);
  });

  it('resets stats across days', () => {
    const yesterday = addCompletedFocus(createDailyStats('2026-05-10'), 1500);

    expect(ensureTodayStats(yesterday, '2026-05-11')).toEqual(createDailyStats('2026-05-11'));
  });
});
