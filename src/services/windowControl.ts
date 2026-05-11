import type { WindowMode } from '../domain/types';

export async function applyWindowMode(mode: WindowMode, alwaysOnTop: boolean): Promise<void> {
  if (!('__TAURI_INTERNALS__' in window)) return;
  const { getCurrentWindow, LogicalSize } = await import('@tauri-apps/api/window');
  const appWindow = getCurrentWindow();
  await appWindow.setAlwaysOnTop(alwaysOnTop);
  if (mode === 'mini') {
    await appWindow.setSize(new LogicalSize(180, 150));
  } else {
    await appWindow.setSize(new LogicalSize(380, 560));
  }
}

export async function startWindowDrag(): Promise<void> {
  if (!('__TAURI_INTERNALS__' in window)) return;
  const { getCurrentWindow } = await import('@tauri-apps/api/window');
  await getCurrentWindow().startDragging();
}
