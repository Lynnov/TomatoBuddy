import { formatDuration } from '../domain/time';
import type { TimerMode } from '../domain/types';
import { PixelCat } from './PixelCat';

interface MiniWidgetProps {
  mode: TimerMode;
  remainingSeconds: number;
  message: string | null;
  onPet: () => void;
  onExpand: () => void;
}

export function MiniWidget({ mode, remainingSeconds, message, onPet, onExpand }: MiniWidgetProps) {
  return (
    <main className="mini-widget" onDoubleClick={onExpand}>
      <PixelCat mode={mode} message={message} onPet={onPet} />
      <strong>{formatDuration(remainingSeconds)}</strong>
    </main>
  );
}
