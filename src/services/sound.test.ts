import { afterEach, describe, expect, it, vi } from 'vitest';
import { playGentleChime } from './sound';

const setValueAtTime = vi.fn();
const exponentialRampToValueAtTime = vi.fn();
const connect = vi.fn();
const start = vi.fn();
const stop = vi.fn();
const close = vi.fn(() => Promise.resolve());

class MockAudioContext {
  currentTime = 1;
  destination = {};

  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime, exponentialRampToValueAtTime },
      connect,
      start,
      stop,
      onended: null as (() => void) | null,
    };
  }

  createGain() {
    return {
      gain: { setValueAtTime, exponentialRampToValueAtTime },
      connect,
    };
  }

  close() {
    return close();
  }
}

describe('playGentleChime', () => {
  afterEach(() => {
    vi.clearAllMocks();
    Reflect.deleteProperty(window, 'AudioContext');
    Reflect.deleteProperty(window, 'webkitAudioContext');
  });

  it('does not create an audio context when disabled', () => {
    const AudioContextSpy = vi.fn(() => new MockAudioContext());
    Reflect.set(window, 'AudioContext', AudioContextSpy);

    playGentleChime(false);

    expect(AudioContextSpy).not.toHaveBeenCalled();
  });

  it('closes the audio context after playback ends', () => {
    const oscillator = {
      type: 'sine',
      frequency: { setValueAtTime, exponentialRampToValueAtTime },
      connect,
      start,
      stop,
      onended: null as (() => void) | null,
    };
    const context = {
      currentTime: 1,
      destination: {},
      createOscillator: vi.fn(() => oscillator),
      createGain: vi.fn(() => ({ gain: { setValueAtTime, exponentialRampToValueAtTime }, connect })),
      close,
    };
    Reflect.set(window, 'AudioContext', vi.fn(function () {
      return context;
    }));

    playGentleChime(true);
    oscillator.onended?.();

    expect(stop).toHaveBeenCalledWith(1.34);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('closes the audio context if playback setup fails', () => {
    const context = new MockAudioContext();
    vi.spyOn(context, 'createGain').mockImplementation(() => {
      throw new Error('gain failed');
    });
    Reflect.set(window, 'AudioContext', vi.fn(function () {
      return context;
    }));

    expect(() => playGentleChime(true)).not.toThrow();

    expect(close).toHaveBeenCalledTimes(1);
  });
});
