import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import tauriConfig from '../../src-tauri/tauri.conf.json';

const tauriRoot = join(process.cwd(), 'src-tauri');

function readCapability(identifier: string) {
  const capabilityPath = join(tauriRoot, 'capabilities', `${identifier}.json`);
  return JSON.parse(readFileSync(capabilityPath, 'utf8')) as { permissions: string[]; windows: string[] };
}

describe('tauri config', () => {
  it('allows a transparent undecorated mini widget window', () => {
    const window = tauriConfig.app.windows[0];

    expect(window.transparent).toBe(true);
    expect(window.decorations).toBe(false);
    expect('minWidth' in window).toBe(false);
    expect('minHeight' in window).toBe(false);
  });

  it('allows window commands needed by full and mini modes', () => {
    const capability = readCapability('main');

    expect(capability.windows).toContain('main');
    expect(capability.permissions).toEqual(
      expect.arrayContaining([
        'core:window:default',
        'core:window:allow-set-always-on-top',
        'core:window:allow-set-decorations',
        'core:window:allow-set-size',
        'core:window:allow-start-dragging',
      ]),
    );
  });
});
