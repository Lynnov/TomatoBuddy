# Release Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close TomatoBuddy v1 P0/P1 release-readiness gaps for mini-widget dragging/readability, cross-day stats, safe Tauri window calls, sound cleanup, and release verification.

**Architecture:** Keep the existing React + domain + services + components structure. Add focused tests first, then make minimal changes in `App`, `MiniWidget`, `windowControl`, `sound`, and `styles.css` so each PRD gap is independently verifiable.

**Tech Stack:** React, TypeScript, Vite, Vitest, React Testing Library, Tauri v2, Web Audio API, CSS.

---

## File Structure

- Modify: `src/App.tsx` — coordinate completed-focus stats updates with current-date correction.
- Modify: `src/App.test.tsx` — add integration coverage for cross-day completion and failed window-control calls.
- Modify: `src/components/MiniWidget.tsx` — add a dedicated drag handle that calls `startWindowDrag()` without interfering with double-click expand.
- Create: `src/components/MiniWidget.test.tsx` — verify drag handle and expand behavior.
- Modify: `src/services/windowControl.ts` — make `applyWindowMode()` and `startWindowDrag()` safe in browser and failed Tauri API paths.
- Create: `src/services/windowControl.test.ts` — verify non-Tauri and rejected Tauri calls do not reject.
- Modify: `src/services/sound.ts` — catch playback failures and close `AudioContext` after playback.
- Create: `src/services/sound.test.ts` — verify disabled sound creates nothing and enabled sound closes context.
- Modify: `src/styles.css` — add mini-widget drag-handle styling and high-readability mini time styling.
- Modify: `src/styles.test.ts` — verify mini time readability styles remain transparent and use text shadow.
- Read-only validation: `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json` — used by Rust/Tauri validation commands.

---

### Task 1: Make window control safe

**Files:**
- Modify: `src/services/windowControl.ts`
- Create: `src/services/windowControl.test.ts`

- [ ] **Step 1: Write failing window-control tests**

Create `src/services/windowControl.test.ts` with:

```ts
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
});
```

- [ ] **Step 2: Run window-control tests and verify failure**

Run:

```bash
npm test -- src/services/windowControl.test.ts
```

Expected: FAIL because `applyWindowMode('mini')` or `startWindowDrag()` rejects when a mocked Tauri API rejects.

- [ ] **Step 3: Implement safe window control**

Replace `src/services/windowControl.ts` with:

```ts
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
```

- [ ] **Step 4: Run window-control tests and verify pass**

Run:

```bash
npm test -- src/services/windowControl.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit window-control safety**

Run:

```bash
git add src/services/windowControl.ts src/services/windowControl.test.ts
git commit -m "fix: make window control calls safe"
```

Expected: commit succeeds.

---

### Task 2: Add mini-widget drag and readability

**Files:**
- Modify: `src/components/MiniWidget.tsx`
- Create: `src/components/MiniWidget.test.tsx`
- Modify: `src/styles.css`
- Modify: `src/styles.test.ts`

- [ ] **Step 1: Write failing mini-widget component tests**

Create `src/components/MiniWidget.test.tsx` with:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MiniWidget } from './MiniWidget';
import { startWindowDrag } from '../services/windowControl';

vi.mock('../services/windowControl', () => ({
  startWindowDrag: vi.fn(() => Promise.resolve()),
}));

describe('MiniWidget', () => {
  it('starts window dragging from the drag handle', () => {
    render(
      <MiniWidget
        mode="focus"
        remainingSeconds={1500}
        message={null}
        onPet={vi.fn()}
        onExpand={vi.fn()}
      />,
    );

    fireEvent.mouseDown(screen.getByRole('button', { name: '拖动迷你挂件' }));

    expect(startWindowDrag).toHaveBeenCalledTimes(1);
  });

  it('expands on double click without requiring the drag handle', () => {
    const onExpand = vi.fn();
    render(
      <MiniWidget
        mode="focus"
        remainingSeconds={1500}
        message={null}
        onPet={vi.fn()}
        onExpand={onExpand}
      />,
    );

    fireEvent.doubleClick(screen.getByRole('main'));

    expect(onExpand).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run mini-widget tests and verify failure**

Run:

```bash
npm test -- src/components/MiniWidget.test.tsx
```

Expected: FAIL because no element has accessible name `拖动迷你挂件`.

- [ ] **Step 3: Implement mini-widget drag handle**

Replace `src/components/MiniWidget.tsx` with:

```tsx
import { formatDuration } from '../domain/time';
import type { TimerMode } from '../domain/types';
import { startWindowDrag } from '../services/windowControl';
import { PixelCat } from './PixelCat';

interface MiniWidgetProps {
  mode: TimerMode;
  remainingSeconds: number;
  message: string | null;
  onPet: () => void;
  onExpand: () => void;
}

export function MiniWidget({ mode, remainingSeconds, message, onPet, onExpand }: MiniWidgetProps) {
  function handleDragStart() {
    void startWindowDrag();
  }

  return (
    <main className="mini-widget" onDoubleClick={onExpand}>
      <button type="button" className="mini-drag-handle" aria-label="拖动迷你挂件" onMouseDown={handleDragStart}>
        ⠿
      </button>
      <PixelCat mode={mode} message={message} onPet={onPet} />
      <strong className="mini-time">{formatDuration(remainingSeconds)}</strong>
    </main>
  );
}
```

- [ ] **Step 4: Run mini-widget tests and verify pass**

Run:

```bash
npm test -- src/components/MiniWidget.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Extend CSS readability test**

Modify `src/styles.test.ts` to:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');

const getRuleBlock = (selector: string) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));

  expect(match, `Expected CSS rule for ${selector}`).not.toBeNull();

  return match?.[1] ?? '';
};

describe('mini widget styles', () => {
  it('keeps mini mode transparent and visually minimal', () => {
    const miniBodyBlock = getRuleBlock('.is-mini-mode body');
    const miniWidgetBlock = getRuleBlock('.is-mini-mode .mini-widget');

    expect(miniBodyBlock).toContain('background: transparent');
    expect(miniWidgetBlock).toContain('border: 0');
    expect(miniWidgetBlock).toContain('box-shadow: none');
    expect(miniWidgetBlock).toContain('padding: 4px');
    expect(miniWidgetBlock).not.toContain('background: rgba(255, 244, 215, 0.94)');
    expect(miniWidgetBlock).not.toContain('box-shadow: 6px 6px 0 #c77738');
  });

  it('keeps mini time readable on light and dark backgrounds', () => {
    const miniTimeBlock = getRuleBlock('.is-mini-mode .mini-time');
    const dragHandleBlock = getRuleBlock('.mini-drag-handle');

    expect(miniTimeBlock).toContain('color: #fff4d7');
    expect(miniTimeBlock).toContain('text-shadow:');
    expect(miniTimeBlock).toContain('#3a2a1c');
    expect(miniTimeBlock).toContain('#ffffff');
    expect(dragHandleBlock).toContain('cursor: grab');
  });
});
```

- [ ] **Step 6: Run style test and verify failure**

Run:

```bash
npm test -- src/styles.test.ts
```

Expected: FAIL because `.is-mini-mode .mini-time` and `.mini-drag-handle` are not styled yet.

- [ ] **Step 7: Add mini-widget drag and time styles**

Edit `src/styles.css` by adding these rules after the `.is-mini-mode .mini-widget` block:

```css
.mini-drag-handle {
  position: absolute;
  top: 2px;
  right: 6px;
  width: 26px;
  height: 22px;
  border: 0;
  background: transparent;
  color: #3a2a1c;
  padding: 0;
  box-shadow: none;
  cursor: grab;
  font-size: 18px;
  line-height: 1;
  opacity: 0.7;
}

.mini-drag-handle:active {
  transform: none;
  box-shadow: none;
  cursor: grabbing;
}

.is-mini-mode .mini-time {
  color: #fff4d7;
  text-shadow:
    -2px -2px 0 #3a2a1c,
    2px -2px 0 #3a2a1c,
    -2px 2px 0 #3a2a1c,
    2px 2px 0 #3a2a1c,
    0 0 8px #ffffff;
}
```

- [ ] **Step 8: Run mini-widget and style tests**

Run:

```bash
npm test -- src/components/MiniWidget.test.tsx src/styles.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit mini-widget release fixes**

Run:

```bash
git add src/components/MiniWidget.tsx src/components/MiniWidget.test.tsx src/styles.css src/styles.test.ts
git commit -m "fix: make mini widget draggable and readable"
```

Expected: commit succeeds.

---

### Task 3: Fix cross-day focus completion stats

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Add failing cross-day app test**

Append this test inside the existing `describe('App', () => { ... })` block in `src/App.test.tsx`:

```tsx
  it('counts a completed focus session on the current day after midnight', () => {
    vi.setSystemTime(new Date('2026-05-11T23:59:30+08:00'));
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '开始专注' }));

    act(() => {
      vi.setSystemTime(new Date('2026-05-12T00:24:30+08:00'));
      vi.advanceTimersByTime(25 * 60 * 1000);
    });

    const saved = JSON.parse(localStorage.getItem('tomato-buddy:v1') ?? '{}');

    expect(screen.getByText('今日小鱼干：1 条')).toBeInTheDocument();
    expect(saved.stats).toEqual({
      date: '2026-05-12',
      completedPomodoros: 1,
      focusSeconds: 1500,
      fishCount: 1,
    });
  });
```

- [ ] **Step 2: Run app tests and verify failure**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because saved stats keep date `2026-05-11` after a focus completion that occurs on `2026-05-12`.

- [ ] **Step 3: Implement cross-day stats correction**

Modify the imports and completed-focus stats update in `src/App.tsx`.

Change the stats import to:

```ts
import { addCompletedFocus, ensureTodayStats, formatFocusTotal } from './domain/stats';
```

Replace the completed-focus block inside the interval callback with:

```ts
        if (current.mode === 'focus' && next.mode === 'focusComplete') {
          setStats((currentStats) => addCompletedFocus(ensureTodayStats(currentStats, todayString()), current.durationSeconds));
          playGentleChime(settings.soundEnabled);
        }
```

- [ ] **Step 4: Run app tests and verify pass**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit cross-day stats fix**

Run:

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "fix: reset daily stats across midnight"
```

Expected: commit succeeds.

---

### Task 4: Release audio resources safely

**Files:**
- Modify: `src/services/sound.ts`
- Create: `src/services/sound.test.ts`

- [ ] **Step 1: Write failing sound tests**

Create `src/services/sound.test.ts` with:

```ts
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
    Reflect.set(window, 'AudioContext', vi.fn(() => context));

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
    Reflect.set(window, 'AudioContext', vi.fn(() => context));

    expect(() => playGentleChime(true)).not.toThrow();

    expect(close).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run sound tests and verify failure**

Run:

```bash
npm test -- src/services/sound.test.ts
```

Expected: FAIL because the current implementation does not close the audio context and throws on setup failure.

- [ ] **Step 3: Implement safe sound cleanup**

Replace `src/services/sound.ts` with:

```ts
export function playGentleChime(enabled: boolean): void {
  if (!enabled) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  let context: AudioContext | null = null;

  function closeContext() {
    if (!context) return;
    const currentContext = context;
    context = null;
    void currentContext.close().catch(() => undefined);
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
```

- [ ] **Step 4: Run sound tests and verify pass**

Run:

```bash
npm test -- src/services/sound.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit sound cleanup**

Run:

```bash
git add src/services/sound.ts src/services/sound.test.ts
git commit -m "fix: release prompt sound resources"
```

Expected: commit succeeds.

---

### Task 5: Validate release readiness

**Files:**
- Modify only if validation finds a defect in previously changed files.

- [ ] **Step 1: Run the full frontend test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 2: Run the frontend production build**

Run:

```bash
npm run build
```

Expected: PASS and `dist` is created.

- [ ] **Step 3: Run Rust/Tauri tests**

Run:

```bash
cargo test --manifest-path "src-tauri/Cargo.toml"
```

Expected: PASS.

- [ ] **Step 4: Run Tauri release build**

Run:

```bash
npm run tauri build
```

Expected: either PASS with Windows artifacts under `src-tauri/target/release/bundle`, or FAIL with a clearly recorded external dependency error such as WiX download timeout. If the failure is unrelated to external download, fix the relevant source issue before proceeding.

- [ ] **Step 5: Inspect git status**

Run:

```bash
git status --short
```

Expected: only intentional source/test/docs changes are present. Do not include generated `dist`, `src-tauri/target`, or unrelated untracked files in commits.

- [ ] **Step 6: Commit any validation fixes**

If validation required source changes, run:

```bash
git add src/App.tsx src/App.test.tsx src/components/MiniWidget.tsx src/components/MiniWidget.test.tsx src/services/windowControl.ts src/services/windowControl.test.ts src/services/sound.ts src/services/sound.test.ts src/styles.css src/styles.test.ts
git commit -m "fix: complete release readiness validation"
```

Expected: commit succeeds only if Step 5 shows intentional validation fixes. If no files changed, skip this commit.

---

## Self-Review

### Spec coverage

- P0-1 Windows build validation: Task 5 runs `npm run tauri build` and requires recording WiX/external dependency failures honestly.
- P0-2 mini widget dragging: Task 2 adds a drag handle and component test for `startWindowDrag()`.
- P0-3 mini widget readability: Task 2 adds mini time text-shadow styling and CSS tests.
- P1-1 cross-day stats: Task 3 adds failing integration coverage and corrects completed-focus stats with `ensureTodayStats()`.
- P1-2 window API error handling: Task 1 adds safe wrappers and tests rejected Tauri calls.
- P1-3 sound resource release: Task 4 adds sound tests and closes `AudioContext` after playback or setup failure.

### Placeholder scan

The plan contains no placeholders and no undefined follow-up implementation steps. Every code-writing step includes concrete file content or exact code blocks.

### Type consistency

The plan uses existing project types and names: `WindowMode`, `TimerMode`, `ensureTodayStats`, `addCompletedFocus`, `startWindowDrag`, `applyWindowMode`, `MiniWidget`, and `playGentleChime`. New tests use the current Vitest and React Testing Library setup.
