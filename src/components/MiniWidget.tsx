import { formatDuration } from '../domain/time';
import type { TimerMode } from '../domain/types';
import { startWindowDrag } from '../services/windowControl';
import { PixelCat } from './PixelCat';

interface MiniWidgetProps {
  mode: TimerMode;
  remainingSeconds: number;
  message: string | null;
  onPet: () => void;
  onExpand: () => void;
}

export function MiniWidget({ mode, remainingSeconds, message, onPet, onExpand }: MiniWidgetProps) {
  function handleDragStart() {
    void startWindowDrag();
  }

  return (
    <main className="mini-widget" onDoubleClick={onExpand}>
      <button
        type="button"
        className="mini-drag-handle"
        aria-label="拖动迷你挂件"
        onMouseDown={handleDragStart}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        ⠿
      </button>
      <PixelCat mode={mode} message={message} onPet={onPet} />
      <strong className="mini-time">{formatDuration(remainingSeconds)}</strong>
    </main>
  );
}
