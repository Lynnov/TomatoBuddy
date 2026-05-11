import { formatDuration } from '../domain/time';
import type { TimerMode } from '../domain/types';

const labels: Record<TimerMode, string> = {
  idle: '猫猫已经坐好',
  focus: '专注陪伴中',
  paused: '暂停中',
  focusComplete: '专注完成',
  break: '和猫猫休息中',
  breakComplete: '休息完成',
};

interface TimerDisplayProps {
  mode: TimerMode;
  remainingSeconds: number;
}

export function TimerDisplay({ mode, remainingSeconds }: TimerDisplayProps) {
  return (
    <section className="timer-display" aria-label="计时状态">
      <p className="timer-mode">{labels[mode]}</p>
      <p className="timer-time">{formatDuration(remainingSeconds)}</p>
    </section>
  );
}
