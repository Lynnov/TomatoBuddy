import type { TimerMode } from '../domain/types';

interface PixelCatProps {
  mode: TimerMode;
  message: string | null;
  onPet: () => void;
}

export function PixelCat({ mode, message, onPet }: PixelCatProps) {
  return (
    <button type="button" className={`pixel-cat pixel-cat-${mode}`} onClick={onPet} aria-label="摸摸猫猫">
      <span className="cat-ear cat-ear-left" />
      <span className="cat-ear cat-ear-right" />
      <span className="cat-face">
        <span className="cat-eye cat-eye-left" />
        <span className="cat-eye cat-eye-right" />
        <span className="cat-mouth" />
      </span>
      <span className="cat-tail" />
      {message && <span className="cat-bubble">{message}</span>}
    </button>
  );
}
