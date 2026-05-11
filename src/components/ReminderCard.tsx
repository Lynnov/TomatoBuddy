import type { TimerMode } from '../domain/types';

interface ReminderCardProps {
  mode: TimerMode;
  onPrimary: () => void;
  onDismiss: () => void;
}

export function ReminderCard({ mode, onPrimary, onDismiss }: ReminderCardProps) {
  if (mode !== 'focusComplete' && mode !== 'breakComplete') return null;

  const focusComplete = mode === 'focusComplete';

  return (
    <aside className="reminder-card" role="dialog" aria-live="polite">
      <strong>{focusComplete ? '太棒了！' : '猫猫伸了个懒腰。'}</strong>
      <p>{focusComplete ? '猫猫奖励你一条小鱼干。' : '要开始下一轮了吗？'}</p>
      <div className="reminder-actions">
        <button type="button" onClick={onPrimary}>{focusComplete ? '开始休息' : '开始下一轮'}</button>
        <button type="button" className="secondary" onClick={onDismiss}>稍后</button>
      </div>
    </aside>
  );
}
