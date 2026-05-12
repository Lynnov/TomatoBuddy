# Transparent Mini Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make mini mode render as a transparent, undecorated desktop companion that shows only the pixel cat and timer core.

**Architecture:** Keep the existing `App.tsx` mini-mode branch and `MiniWidget` component. Implement the behavior through focused CSS overrides, Tauri window configuration, and existing `applyWindowMode` runtime window switching.

**Tech Stack:** React, TypeScript, Vite, Vitest, Tauri v2, CSS.

---

## File Structure

- Modify: `src/styles.css` — owns visual presentation for full mode and mini mode, including transparent mini-widget overrides.
- Modify: `src/styles.test.ts` — verifies mini-widget CSS guarantees for transparent, unobtrusive mini mode.
- Modify: `src-tauri/tauri.conf.json` — owns startup Tauri window capabilities such as transparency, decorations, and minimum size constraints.
- Modify: `src/config/tauriConfig.test.ts` — verifies Tauri config allows compact transparent mini mode.
- Leave unchanged: `src/components/MiniWidget.tsx` — already renders only `PixelCat` plus formatted time and supports double-click expand.
- Leave unchanged: `src/services/windowControl.ts` — already switches mini mode to undecorated `180x150` and restores full mode dimensions.

### Task 1: Lock Mini CSS Expectations

**Files:**
- Modify: `src/styles.test.ts`
- Test: `src/styles.test.ts`

- [ ] **Step 1: Replace the existing mini-widget style test with failing expectations**

Replace `src/styles.test.ts` with:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');

describe('mini widget styles', () => {
  it('keeps mini mode transparent and visually minimal', () => {
    expect(css).toContain('.is-mini-mode body');
    expect(css).toContain('background: transparent');
    expect(css).toContain('.is-mini-mode .mini-widget');
    expect(css).toContain('border: 0');
    expect(css).toContain('box-shadow: none');
    expect(css).toContain('padding: 4px');
    expect(css).not.toContain('background: rgba(255, 244, 215, 0.94)');
    expect(css).not.toContain('box-shadow: 6px 6px 0 #c77738');
  });
});
```

- [ ] **Step 2: Run the style test to verify it fails**

Run: `npm test -- src/styles.test.ts`

Expected: FAIL because `src/styles.css` still contains `background: rgba(255, 244, 215, 0.94)` under `.is-mini-mode .mini-widget` and does not yet contain `padding: 4px` for the mini override.

- [ ] **Step 3: Commit the failing test**

```bash
git add src/styles.test.ts
git commit -m "test: lock transparent mini widget styling"
```

### Task 2: Make Mini CSS Transparent

**Files:**
- Modify: `src/styles.css:240`
- Test: `src/styles.test.ts`

- [ ] **Step 1: Update base and mini-mode CSS**

In `src/styles.css`, replace the current `.mini-widget`, `.is-mini-mode .mini-widget`, `.mini-widget .pixel-cat`, and `.mini-widget strong` block with:

```css
.mini-widget {
  width: 180px;
  min-height: 150px;
  display: grid;
  place-items: center;
  padding: 12px;
  border: 4px solid #3a2a1c;
  background: #fff4d7;
  box-shadow: 6px 6px 0 #c77738;
}

.is-mini-mode .mini-widget {
  width: 180px;
  min-height: 150px;
  padding: 4px;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.mini-widget .pixel-cat {
  transform: scale(0.7);
  margin: -10px auto -6px;
}

.is-mini-mode .mini-widget .pixel-cat {
  margin: -14px auto -12px;
}

.is-mini-mode .mini-widget .cat-bubble {
  box-shadow: none;
}

.mini-widget strong {
  font-size: 24px;
}
```

- [ ] **Step 2: Run the style test to verify it passes**

Run: `npm test -- src/styles.test.ts`

Expected: PASS.

- [ ] **Step 3: Commit the CSS implementation**

```bash
git add src/styles.css
git commit -m "style: make mini widget transparent"
```

### Task 3: Lock Tauri Startup Window Expectations

**Files:**
- Modify: `src/config/tauriConfig.test.ts`
- Test: `src/config/tauriConfig.test.ts`

- [ ] **Step 1: Keep the existing Tauri config test focused on compact transparent windows**

Ensure `src/config/tauriConfig.test.ts` contains:

```ts
import { describe, expect, it } from 'vitest';
import tauriConfig from '../../src-tauri/tauri.conf.json';

describe('tauri config', () => {
  it('allows a transparent undecorated mini widget window', () => {
    const window = tauriConfig.app.windows[0];

    expect(window.transparent).toBe(true);
    expect(window.decorations).toBe(false);
    expect(window.minWidth).toBeUndefined();
    expect(window.minHeight).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the Tauri config test to verify it fails**

Run: `npm test -- src/config/tauriConfig.test.ts`

Expected: FAIL because `src-tauri/tauri.conf.json` still has `decorations: true`, `minWidth: 280`, and `minHeight: 220`.

- [ ] **Step 3: Commit the failing config test**

```bash
git add src/config/tauriConfig.test.ts
git commit -m "test: lock compact transparent tauri window config"
```

### Task 4: Update Tauri Startup Window Config

**Files:**
- Modify: `src-tauri/tauri.conf.json:13`
- Test: `src/config/tauriConfig.test.ts`

- [ ] **Step 1: Update the primary window config**

In `src-tauri/tauri.conf.json`, change the first `app.windows` item to:

```json
{
  "title": "TomatoBuddy",
  "width": 380,
  "height": 560,
  "resizable": true,
  "decorations": false,
  "transparent": true,
  "alwaysOnTop": true
}
```

- [ ] **Step 2: Run the Tauri config test to verify it passes**

Run: `npm test -- src/config/tauriConfig.test.ts`

Expected: PASS.

- [ ] **Step 3: Commit the Tauri config implementation**

```bash
git add src-tauri/tauri.conf.json
git commit -m "fix: allow compact transparent tauri window"
```

### Task 5: Final Verification

**Files:**
- Verify: `src/styles.css`
- Verify: `src/styles.test.ts`
- Verify: `src-tauri/tauri.conf.json`
- Verify: `src/config/tauriConfig.test.ts`

- [ ] **Step 1: Run the full test suite**

Run: `npm test`

Expected: PASS for all Vitest tests.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: PASS with TypeScript compile and Vite build completing successfully.

- [ ] **Step 3: Inspect git status**

Run: `git status --short`

Expected: no unexpected files beyond the planned modified or newly tracked files.

- [ ] **Step 4: Do not commit unless explicitly requested**

Because this user did not ask for commits in this session, skip the commit steps above unless the user explicitly requests committing changes.

## Self-Review

- Spec coverage: UI transparency, compact visual styling, Tauri transparent startup support, and config/style tests are covered by Tasks 1-5.
- Placeholder scan: no TBD, TODO, or unspecified implementation steps remain.
- Type consistency: existing file paths, CSS selectors, JSON keys, and Vitest imports match the current project files.
