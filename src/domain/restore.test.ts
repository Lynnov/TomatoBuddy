import { describe, expect, it } from 'vitest';
import { createInitialTimer, startFocus, pauseTimer } from './timer';
import { restoreTimer } from './restore';

describe('restoreTimer', () => {
  it('restores running focus with elapsed time deducted', () => {
    const state = startFocus(createInitialTimer(), 25, 5, 1000);
    const restored = restoreTimer(state, 61_000);

    expect(restored.mode).toBe('focus');
    expect(restored.status).toBe('running');
    expect(restored.remainingSeconds).toBe(1440);
  });

  it('restores running focus as complete when end time passed', () => {
    const state = startFocus(createInitialTimer(), 25, 5, 1000);
    const restored = restoreTimer(state, 1_600_000);

    expect(restored.mode).toBe('focusComplete');
    expect(restored.status).toBe('completed');
    expect(restored.remainingSeconds).toBe(0);
  });

  it('keeps paused timers paused', () => {
    const paused = pauseTimer(startFocus(createInitialTimer(), 25, 5, 1000), 301_000);
    const restored = restoreTimer(paused, 900_000);

    expect(restored.mode).toBe('paused');
    expect(restored.status).toBe('paused');
    expect(restored.remainingSeconds).toBe(1200);
  });
});
