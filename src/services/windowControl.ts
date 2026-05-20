import type { WindowMode } from '../domain/types';

async function getTauriWindow() {
  if (!('__TAURI_INTERNALS__' in window)) return null;

  try {
    return await import('@tauri-apps/api/window');
  } catch {
    return null;
  }
}

export async function applyWindowMode(mode: WindowMode, alwaysOnTop: boolean): Promise<void> {
  const tauriWindow = await getTauriWindow();
  if (!tauriWindow) return;

  try {
    const { getCurrentWindow, LogicalSize } = tauriWindow;
    const appWindow = getCurrentWindow();
    await appWindow.setAlwaysOnTop(alwaysOnTop);
    if (mode === 'mini') {
      await appWindow.setDecorations(false);
      await appWindow.setSize(new LogicalSize(180, 150));
    } else {
      await appWindow.setDecorations(true);
      await appWindow.setSize(new LogicalSize(380, 560));
    }
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
