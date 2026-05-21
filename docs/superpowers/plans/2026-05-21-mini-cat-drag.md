# Mini Cat Drag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the mini widget draggable by dragging the cat itself, while preserving cat click and mini widget double-click behavior.

**Architecture:** The drag affordance belongs to `PixelCat` as an optional root-level mouse-down handler, so future cat artwork can change size or internal markup without breaking dragging. `MiniWidget` owns the window-drag service call and passes it to `PixelCat`; the explicit six-dot drag handle is removed.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Tauri window API through `src/services/windowControl.ts`.

---

## File Structure

- Modify `src/components/PixelCat.tsx`: add optional `onDragStart` prop and attach it to the cat root button with `onMouseDown`.
- Modify `src/components/MiniWidget.tsx`: remove the six-dot drag handle and pass `handleDragStart` into `PixelCat`.
- Modify `src/components/MiniWidget.test.tsx`: update tests so the cat root is the drag target; keep click and double-click behavior covered.
- Modify `src/styles.css`: remove `.mini-drag-handle` styles and add mini-mode cursor styling to `.mini-widget .pixel-cat`.

---

### Task 1: Move Drag Target To PixelCat

**Files:**
- Modify: `src/components/PixelCat.tsx`
- Modify: `src/components/MiniWidget.tsx`
- Test: `src/components/MiniWidget.test.tsx`

- [ ] **Step 1: Write failing tests for cat drag behavior**

Replace `src/components/MiniWidget.test.tsx` with:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MiniWidget } from './MiniWidget';
import { startWindowDrag } from '../services/windowControl';

vi.mock('../services/windowControl', () => ({
  startWindowDrag: vi.fn(() => Promise.resolve()),
}));

describe('MiniWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts window dragging from the cat', () => {
    render(
      <MiniWidget
        mode="focus"
        remainingSeconds={1500}
        message={null}
        onPet={vi.fn()}
        onExpand={vi.fn()}
      />,
    );

    fireEvent.mouseDown(screen.getByRole('button', { name: '摸摸猫猫' }));

    expect(startWindowDrag).toHaveBeenCalledTimes(1);
  });

  it('keeps petting the cat on click', () => {
    const onPet = vi.fn();
    render(
      <MiniWidget
        mode="focus"
        remainingSeconds={1500}
        message={null}
        onPet={onPet}
        onExpand={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '摸摸猫猫' }));

    expect(onPet).toHaveBeenCalledTimes(1);
  });

  it('expands on double click without requiring a drag handle', () => {
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

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/MiniWidget.test.tsx
```

Expected: FAIL because mouse-down on `摸摸猫猫` does not call `startWindowDrag` yet.

- [ ] **Step 3: Add optional drag prop to PixelCat**

Update `src/components/PixelCat.tsx` to:

```tsx
import type { MouseEventHandler } from 'react';
import type { TimerMode } from '../domain/types';

interface PixelCatProps {
  mode: TimerMode;
  message: string | null;
  onPet: () => void;
  onDragStart?: MouseEventHandler<HTMLButtonElement>;
}

export function PixelCat({ mode, message, onPet, onDragStart }: PixelCatProps) {
  return (
    <button
      type="button"
      className={`pixel-cat pixel-cat-${mode}`}
      onClick={onPet}
      onMouseDown={onDragStart}
      aria-label="摸摸猫猫"
    >
      <span className="cat-ear cat-ear-left" />
      <span className="cat-ear cat-ear-right" />
      <span className="cat-face">
        <span className="cat-eye cat-eye-left" />
        <span className="cat-eye cat-eye-right" />
        <span className="cat-mouth" />
      </span>
      <span className="cat-tail" />
      {message && <span className="cat-bubble">{message}</span>}
    </button>
  );
}
```

- [ ] **Step 4: Remove handle and pass drag callback from MiniWidget**

Update `src/components/MiniWidget.tsx` to:

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
      <PixelCat mode={mode} message={message} onPet={onPet} onDragStart={handleDragStart} />
      <strong className="mini-time">{formatDuration(remainingSeconds)}</strong>
    </main>
  );
}
```

- [ ] **Step 5: Run component test to verify it passes**

Run:

```bash
npm test -- src/components/MiniWidget.test.tsx
```

Expected: PASS with 3 tests passing.

---

### Task 2: Remove Obsolete Drag Handle Styling

**Files:**
- Modify: `src/styles.css`
- Test: `src/styles.test.ts`

- [ ] **Step 1: Write failing style test**

Add this test to `src/styles.test.ts` inside the existing `describe` block:

```ts
  it('uses the mini cat as the drag affordance', () => {
    const css = readFileSync(join(process.cwd(), 'src', 'styles.css'), 'utf8');
    const miniCatBlock = getRuleBlock('.is-mini-mode .mini-widget .pixel-cat');

    expect(css).not.toContain('.mini-drag-handle');
    expect(miniCatBlock).toContain('cursor: grab');
  });
```

- [ ] **Step 2: Run style test to verify it fails**

Run:

```bash
npm test -- src/styles.test.ts
```

Expected: FAIL because `.mini-drag-handle` styles still exist and mini cat does not set `cursor: grab`.

- [ ] **Step 3: Remove handle CSS and add cat cursor styling**

In `src/styles.css`, delete the full `.mini-drag-handle` and `.mini-drag-handle:active` blocks:

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
```

Then update the existing `.is-mini-mode .mini-widget .pixel-cat` block to:

```css
.is-mini-mode .mini-widget .pixel-cat {
  margin: -14px auto -12px;
  cursor: grab;
}

.is-mini-mode .mini-widget .pixel-cat:active {
  cursor: grabbing;
}
```

- [ ] **Step 4: Run style test to verify it passes**

Run:

```bash
npm test -- src/styles.test.ts
```

Expected: PASS.

---

### Task 3: Verify Mini Widget Interaction Set

**Files:**
- Verify: `src/components/MiniWidget.test.tsx`
- Verify: `src/services/windowControl.test.ts`
- Verify: `src/config/tauriConfig.test.ts`
- Verify: `src/styles.test.ts`

- [ ] **Step 1: Run focused interaction tests**

Run:

```bash
npm test -- src/components/MiniWidget.test.tsx src/services/windowControl.test.ts src/config/tauriConfig.test.ts src/styles.test.ts
```

Expected: PASS with no failed tests.

- [ ] **Step 2: Run full frontend tests**

Run:

```bash
npm test
```

Expected: PASS with all test files passing.

- [ ] **Step 3: Run frontend build**

Run:

```bash
npm run build
```

Expected: PASS, with `tsc` and `vite build` both completing successfully.

---

## Self-Review

- Spec coverage: The plan moves dragging to the cat root, preserves click petting, preserves double-click expansion, removes the visible six-dot handle, and avoids coupling to current cat dimensions by binding the event to `PixelCat` root.
- Placeholder scan: No TBD/TODO placeholders remain.
- Type consistency: `onDragStart?: MouseEventHandler<HTMLButtonElement>` is defined in `PixelCat` and passed from `MiniWidget` as `handleDragStart`.
