import type { WindowMode } from '../domain/types';

async function getTauriWindow() {
  if (!('__TAURI_INTERNALS__' in window)) return null;

  try {
    return await import('@tauri-apps/api/window');
  } catch {
    return null;
  }
}

async function runBestEffort(operation: () => Promise<void>): Promise<void> {
  try {
    await operation();
  } catch {
    return;
  }
}

export async function applyWindowMode(mode: WindowMode, alwaysOnTop: boolean): Promise<void> {
  const tauriWindow = await getTauriWindow();
  if (!tauriWindow) return;

  try {
    const { getCurrentWindow, LogicalSize } = tauriWindow;
    const appWindow = getCurrentWindow();
    const decorations = mode === 'mini' ? false : true;
    const size = mode === 'mini' ? new LogicalSize(180, 150) : new LogicalSize(380, 560);

    await runBestEffort(() => appWindow.setAlwaysOnTop(alwaysOnTop));
    await runBestEffort(() => appWindow.setDecorations(decorations));
    await runBestEffort(() => appWindow.setSize(size));
  } catch {
    return;
  }
}

export async function startWindowDrag(): Promise<void> {
  const tauriWindow = await getTauriWindow();
  if (!tauriWindow) return;

  try {
    await tauriWindow.getCurrentWindow().startDragging();
  } catch {
    return;
  }
}
