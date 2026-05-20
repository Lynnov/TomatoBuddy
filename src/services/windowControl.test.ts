import { afterEach, describe, expect, it, vi } from 'vitest';

const setAlwaysOnTop = vi.fn();
const setDecorations = vi.fn();
const setSize = vi.fn();
const startDragging = vi.fn();

vi.mock('@tauri-apps/api/window', () => ({
  LogicalSize: class LogicalSize {
    width: number;
    height: number;

    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
    }
  },
  getCurrentWindow: () => ({
    setAlwaysOnTop,
    setDecorations,
    setSize,
    startDragging,
  }),
}));

describe('windowControl', () => {
  afterEach(() => {
    vi.clearAllMocks();
    Reflect.deleteProperty(window, '__TAURI_INTERNALS__');
  });

  it('does nothing outside Tauri', async () => {
    const { applyWindowMode, startWindowDrag } = await import('./windowControl');

    await expect(applyWindowMode('mini', true)).resolves.toBeUndefined();
    await expect(startWindowDrag()).resolves.toBeUndefined();

    expect(setAlwaysOnTop).not.toHaveBeenCalled();
    expect(startDragging).not.toHaveBeenCalled();
  });

  it('applies mini and full mode in Tauri', async () => {
    Reflect.set(window, '__TAURI_INTERNALS__', {});
    const { applyWindowMode } = await import('./windowControl');

    await expect(applyWindowMode('mini', true)).resolves.toBeUndefined();
    await expect(applyWindowMode('full', false)).resolves.toBeUndefined();

    expect(setAlwaysOnTop).toHaveBeenNthCalledWith(1, true);
    expect(setDecorations).toHaveBeenNthCalledWith(1, false);
    expect(setSize).toHaveBeenNthCalledWith(1, expect.objectContaining({ width: 180, height: 150 }));
    expect(setAlwaysOnTop).toHaveBeenNthCalledWith(2, false);
    expect(setDecorations).toHaveBeenNthCalledWith(2, true);
    expect(setSize).toHaveBeenNthCalledWith(2, expect.objectContaining({ width: 380, height: 560 }));
  });

  it('does not reject when Tauri window APIs fail', async () => {
    Reflect.set(window, '__TAURI_INTERNALS__', {});
    setSize.mockRejectedValueOnce(new Error('resize failed'));
    startDragging.mockRejectedValueOnce(new Error('drag failed'));
    const { applyWindowMode, startWindowDrag } = await import('./windowControl');

    await expect(applyWindowMode('mini', true)).resolves.toBeUndefined();
    await expect(startWindowDrag()).resolves.toBeUndefined();
  });

  it('does not reject when Tauri window import fails', async () => {
    Reflect.set(window, '__TAURI_INTERNALS__', {});
    vi.resetModules();
    vi.doMock('@tauri-apps/api/window', () => {
      throw new Error('import failed');
    });
    const { applyWindowMode, startWindowDrag } = await import('./windowControl');

    await expect(applyWindowMode('mini', true)).resolves.toBeUndefined();
    await expect(startWindowDrag()).resolves.toBeUndefined();
  });
});
