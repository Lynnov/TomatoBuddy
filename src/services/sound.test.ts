import { afterEach, describe, expect, it, vi } from 'vitest';
import { playGentleChime } from './sound';

const setValueAtTime = vi.fn();
const exponentialRampToValueAtTime = vi.fn();
const connect = vi.fn();
const start = vi.fn();
const stop = vi.fn();
const close = vi.fn(() => Promise.resolve());
const originalAudioContext = window.AudioContext;
const originalWebkitAudioContext = window.webkitAudioContext;

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
    Reflect.set(window, 'AudioContext', originalAudioContext);
    Reflect.set(window, 'webkitAudioContext', originalWebkitAudioContext);
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

  it('ignores rejected audio context close after playback ends', async () => {
    const oscillator = {
      type: 'sine',
      frequency: { setValueAtTime, exponentialRampToValueAtTime },
      connect,
      start,
      stop,
      onended: null as (() => void) | null,
    };
    const rejectedClose = vi.fn(() => Promise.reject(new Error('close failed')));
    const context = {
      currentTime: 1,
      destination: {},
      createOscillator: vi.fn(() => oscillator),
      createGain: vi.fn(() => ({ gain: { setValueAtTime, exponentialRampToValueAtTime }, connect })),
      close: rejectedClose,
    };
    Reflect.set(window, 'AudioContext', vi.fn(function () {
      return context;
    }));

    playGentleChime(true);
    expect(() => oscillator.onended?.()).not.toThrow();
    await Promise.resolve();

    expect(rejectedClose).toHaveBeenCalledTimes(1);
  });

  it('ignores synchronous audio context close failures after playback ends', () => {
    const oscillator = {
      type: 'sine',
      frequency: { setValueAtTime, exponentialRampToValueAtTime },
      connect,
      start,
      stop,
      onended: null as (() => void) | null,
    };
    const throwingClose = vi.fn(() => {
      throw new Error('close failed');
    });
    const context = {
      currentTime: 1,
      destination: {},
      createOscillator: vi.fn(() => oscillator),
      createGain: vi.fn(() => ({ gain: { setValueAtTime, exponentialRampToValueAtTime }, connect })),
      close: throwingClose,
    };
    Reflect.set(window, 'AudioContext', vi.fn(function () {
      return context;
    }));

    playGentleChime(true);

    expect(() => oscillator.onended?.()).not.toThrow();
    expect(throwingClose).toHaveBeenCalledTimes(1);
  });

  it('handles promise-like audio context close failures', () => {
    const oscillator = {
      type: 'sine',
      frequency: { setValueAtTime, exponentialRampToValueAtTime },
      connect,
      start,
      stop,
      onended: null as (() => void) | null,
    };
    const closeCatch = vi.fn();
    const promiseLikeClose = vi.fn(() => ({
      catch: closeCatch,
    }));
    const context = {
      currentTime: 1,
      destination: {},
      createOscillator: vi.fn(() => oscillator),
      createGain: vi.fn(() => ({ gain: { setValueAtTime, exponentialRampToValueAtTime }, connect })),
      close: promiseLikeClose,
    };
    Reflect.set(window, 'AudioContext', vi.fn(function () {
      return context;
    }));

    playGentleChime(true);
    oscillator.onended?.();

    expect(promiseLikeClose).toHaveBeenCalledTimes(1);
    expect(closeCatch).toHaveBeenCalledWith(expect.any(Function));
  });

  it('closes the audio context if playback start fails', () => {
    const throwingStart = vi.fn(() => {
      throw new Error('start failed');
    });
    const oscillator = {
      type: 'sine',
      frequency: { setValueAtTime, exponentialRampToValueAtTime },
      connect,
      start: throwingStart,
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

    expect(() => playGentleChime(true)).not.toThrow();

    expect(throwingStart).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('closes the audio context if playback start or stop fails', () => {
    const throwingStop = vi.fn(() => {
      throw new Error('stop failed');
    });
    const oscillator = {
      type: 'sine',
      frequency: { setValueAtTime, exponentialRampToValueAtTime },
      connect,
      start,
      stop: throwingStop,
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

    expect(() => playGentleChime(true)).not.toThrow();

    expect(throwingStop).toHaveBeenCalledWith(1.34);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
