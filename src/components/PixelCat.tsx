import type { TimerMode } from '../domain/types';
import { SukiyakiCatSvg } from './SukiyakiCatSvg';

interface PixelCatProps {
  mode: TimerMode;
  message: string | null;
  onPet: () => void;
}

export function PixelCat({ mode, message, onPet }: PixelCatProps) {
  return (
    <button
      type="button"
      className={`pixel-cat pixel-cat-${mode}`}
      onClick={onPet}
      aria-label="摸摸猫猫"
    >
      <SukiyakiCatSvg />
      {message && <span className="cat-bubble">{message}</span>}
    </button>
  );
}
