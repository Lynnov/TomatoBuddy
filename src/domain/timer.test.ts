import { describe, expect, it } from 'vitest';
import { createInitialTimer, startFocus, pauseTimer, resumeTimer, resetTimer, completeTimer, startBreak, startNextFocus } from './timer';

describe('timer domain', () => {
  it('starts a focus session from idle state', () => {
    const timer = startFocus(createInitialTimer(), 25, 5, 1000);

    expect(timer.mode).toBe('focus');
    expect(timer.status).toBe('running');
    expect(timer.durationSeconds).toBe(1500);
    expect(timer.startedAt).toBe(1000);
  });

  it('pauses and resumes without losing remaining seconds', () => {
    const running = startFocus(createInitialTimer(), 25, 5, 1000);
    const paused = pauseTimer(running, 301000);
    const resumed = resumeTimer(paused, 400000);

    expect(paused.status).toBe('paused');
    expect(paused.remainingSeconds).toBe(1200);
    expect(resumed.status).toBe('running');
    expect(resumed.remainingSeconds).toBe(1200);
    expect(resumed.startedAt).toBe(400000);
  });

  it('moves from focus complete to break only when user starts break', () => {
    const running = startFocus(createInitialTimer(), 25, 5, 1000);
    const completed = completeTimer(running);
    const resting = startBreak(completed, 3000);

    expect(completed.mode).toBe('focusComplete');
    expect(completed.status).toBe('completed');
    expect(resting.mode).toBe('break');
    expect(resting.durationSeconds).toBe(300);
    expect(resting.status).toBe('running');
  });

  it('starts the next focus only when user confirms after break completion', () => {
    const breakComplete = completeTimer(startBreak(completeTimer(startFocus(createInitialTimer(), 25, 5, 1000)), 3000));
    const next = startNextFocus(breakComplete, 25, 5, 4000);

    expect(breakComplete.mode).toBe('breakComplete');
    expect(next.mode).toBe('focus');
    expect(next.status).toBe('running');
  });

  it('resets to idle with selected durations', () => {
    const running = startFocus(createInitialTimer(), 50, 10, 1000);
    const reset = resetTimer(running, 50, 10);

    expect(reset.mode).toBe('idle');
    expect(reset.status).toBe('idle');
    expect(reset.remainingSeconds).toBe(3000);
  });
});
