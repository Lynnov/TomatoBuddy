import type { TimerState } from './types';

export function createInitialTimer(focusMinutes = 25, breakMinutes = 5): TimerState {
  return {
    mode: 'idle',
    previousMode: null,
    status: 'idle',
    focusMinutes,
    breakMinutes,
    durationSeconds: focusMinutes * 60,
    remainingSeconds: focusMinutes * 60,
    startedAt: null,
  };
}

export function startFocus(state: TimerState, focusMinutes: number, breakMinutes: number, now: number): TimerState {
  return {
    ...state,
    mode: 'focus',
    previousMode: null,
    status: 'running',
    focusMinutes,
    breakMinutes,
    durationSeconds: focusMinutes * 60,
    remainingSeconds: focusMinutes * 60,
    startedAt: now,
  };
}

export function pauseTimer(state: TimerState, now: number): TimerState {
  if (state.status !== 'running' || state.startedAt === null) return state;
  const elapsed = Math.floor((now - state.startedAt) / 1000);
  return {
    ...state,
    mode: 'paused',
    previousMode: state.mode === 'break' ? 'break' : 'focus',
    status: 'paused',
    remainingSeconds: Math.max(0, state.remainingSeconds - elapsed),
    startedAt: null,
  };
}

export function resumeTimer(state: TimerState, now: number): TimerState {
  if (state.status !== 'paused') return state;
  return {
    ...state,
    mode: state.previousMode ?? 'focus',
    status: 'running',
    startedAt: now,
  };
}

export function resetTimer(_state: TimerState, focusMinutes: number, breakMinutes: number): TimerState {
  return createInitialTimer(focusMinutes, breakMinutes);
}

export function completeTimer(state: TimerState): TimerState {
  if (state.mode === 'break') {
    return { ...state, mode: 'breakComplete', status: 'completed', remainingSeconds: 0, startedAt: null };
  }
  return { ...state, mode: 'focusComplete', status: 'completed', remainingSeconds: 0, startedAt: null };
}

export function startBreak(state: TimerState, now: number): TimerState {
  return {
    ...state,
    mode: 'break',
    previousMode: null,
    status: 'running',
    durationSeconds: state.breakMinutes * 60,
    remainingSeconds: state.breakMinutes * 60,
    startedAt: now,
  };
}

export function startNextFocus(state: TimerState, focusMinutes: number, breakMinutes: number, now: number): TimerState {
  return startFocus(state, focusMinutes, breakMinutes, now);
}

export function tickTimer(state: TimerState, now: number): TimerState {
  if (state.status !== 'running' || state.startedAt === null) return state;
  const elapsed = Math.floor((now - state.startedAt) / 1000);
  const remainingSeconds = Math.max(0, state.remainingSeconds - elapsed);
  if (remainingSeconds === 0) {
    return completeTimer({ ...state, remainingSeconds: 0 });
  }
  return { ...state, remainingSeconds, startedAt: now };
}
