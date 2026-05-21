import { useEffect, useRef } from 'react';
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

const PET_CLICK_CONFIRM_DELAY_MS = 300;

export function MiniWidget({ mode, remainingSeconds, message, onPet, onExpand }: MiniWidgetProps) {
  const petTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (petTimerRef.current) {
        clearTimeout(petTimerRef.current);
      }
    };
  }, []);

  function handleDragStart() {
    void startWindowDrag();
  }

  function handlePet() {
    if (petTimerRef.current) {
      clearTimeout(petTimerRef.current);
    }

    petTimerRef.current = setTimeout(() => {
      petTimerRef.current = null;
      onPet();
    }, PET_CLICK_CONFIRM_DELAY_MS);
  }

  function handleExpand() {
    if (petTimerRef.current) {
      clearTimeout(petTimerRef.current);
      petTimerRef.current = null;
    }

    onExpand();
  }

  return (
    <main className="mini-widget" onDoubleClick={handleExpand}>
      <PixelCat mode={mode} message={message} onPet={handlePet} onDragStart={handleDragStart} />
      <strong className="mini-time">{formatDuration(remainingSeconds)}</strong>
    </main>
  );
}
