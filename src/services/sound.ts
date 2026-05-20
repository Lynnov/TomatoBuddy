export function playGentleChime(enabled: boolean): void {
  if (!enabled) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  let context: AudioContext | null = null;

  function closeContext() {
    if (!context) return;
    const currentContext = context;
    context = null;

    try {
      const closeResult = currentContext.close();
      if (closeResult instanceof Promise) {
        void closeResult.catch(() => undefined);
      }
    } catch {
      return;
    }
  }

  try {
    context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(660, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, context.currentTime + 0.22);

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.32);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.onended = closeContext;
    oscillator.start();
    oscillator.stop(context.currentTime + 0.34);
  } catch {
    closeContext();
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
