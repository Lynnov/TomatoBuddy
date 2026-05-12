import { describe, expect, it } from 'vitest';
import tauriConfig from '../../src-tauri/tauri.conf.json';

describe('tauri config', () => {
  it('allows a transparent undecorated mini widget window', () => {
    const window = tauriConfig.app.windows[0];

    expect(window.transparent).toBe(true);
    expect(window.decorations).toBe(false);
    expect('minWidth' in window).toBe(false);
    expect('minHeight' in window).toBe(false);
  });
});
