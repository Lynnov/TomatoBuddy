import type { TimerState } from './types';
import { completeTimer } from './timer';

export function restoreTimer(state: TimerState, now: number): TimerState {
  if (state.status !== 'running' || state.startedAt === null) return state;
  const elapsed = Math.floor((now - state.startedAt) / 1000);
  const remainingSeconds = Math.max(0, state.remainingSeconds - elapsed);
  if (remainingSeconds === 0) {
    return completeTimer({ ...state, remainingSeconds: 0, startedAt: null });
  }
  return { ...state, remainingSeconds, startedAt: now };
}
