# Mini Widget Transparency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make mini widget mode use a transparent, undecorated, small desktop window so it does not block lower-level content.

**Architecture:** Keep the mode distinction in React via root classes and in the Tauri integration via `applyWindowMode`. Tauri config enables transparency globally, while runtime window control toggles size and decorations between full and mini modes.

**Tech Stack:** Tauri v2, React, TypeScript, CSS, Vitest, `@tauri-apps/api/window`.

---

### Task 1: Mini widget transparent window behavior

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/styles.css`
- Modify: `src/services/windowControl.ts`
- Modify: `src-tauri/tauri.conf.json`

- [ ] **Step 1: Update tests for mini root class**

In `src/App.test.tsx`, add this test inside `describe('App', () => { ... })`:

```tsx
  it('switches to transparent mini widget shell', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '切换迷你挂件' }));

    expect(screen.getByRole('main')).toHaveClass('mini-widget');
    expect(document.documentElement).toHaveClass('is-mini-mode');
  });
```

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because `document.documentElement` does not yet receive `is-mini-mode`.

- [ ] **Step 2: Add full/mini root class management**

In `src/App.tsx`, add an effect after the `applyWindowMode` effect:

```tsx
  useEffect(() => {
    document.documentElement.classList.toggle('is-mini-mode', ui.windowMode === 'mini');
    document.documentElement.classList.toggle('is-full-mode', ui.windowMode === 'full');
    return () => {
      document.documentElement.classList.remove('is-mini-mode', 'is-full-mode');
    };
  }, [ui.windowMode]);
```

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Toggle native window decorations at runtime**

In `src/services/windowControl.ts`, update `applyWindowMode` so mini mode removes decorations and full mode restores them:

```ts
export async function applyWindowMode(mode: WindowMode, alwaysOnTop: boolean): Promise<void> {
  if (!('__TAURI_INTERNALS__' in window)) return;
  const { getCurrentWindow, LogicalSize } = await import('@tauri-apps/api/window');
  const appWindow = getCurrentWindow();
  await appWindow.setAlwaysOnTop(alwaysOnTop);
  if (mode === 'mini') {
    await appWindow.setDecorations(false);
    await appWindow.setSize(new LogicalSize(180, 150));
  } else {
    await appWindow.setDecorations(true);
    await appWindow.setSize(new LogicalSize(380, 560));
  }
}
```

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Make CSS background transparent in mini mode**

In `src/styles.css`:

1. Change `:root` background to transparent.
2. Add `html, body, #root { background: transparent; }`.
3. Move full background to `.is-full-mode body` and `.is-full-mode .app-shell`.
4. Add `.is-mini-mode body { min-width: 180px; min-height: 150px; background: transparent; }`.
5. Add `.is-mini-mode .mini-widget { background: rgba(255, 244, 215, 0.94); }`.

Run:

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 5: Enable transparent Tauri window**

In `src-tauri/tauri.conf.json`, add to the window config:

```json
"transparent": true,
"decorations": true
```

Keep full mode initially decorated. Runtime code hides decorations only in mini mode.

Run:

```bash
PATH="$HOME/.cargo/bin:$PATH" npm run tauri build -- --bundles nsis
```

Expected: PASS and regenerate `src-tauri/target/release/bundle/nsis/TomatoBuddy_0.1.0_x64-setup.exe`.

- [ ] **Step 6: Commit**

Run:

```bash
git add docs/superpowers/plans/2026-05-11-mini-widget-transparency.md src/App.tsx src/App.test.tsx src/styles.css src/services/windowControl.ts src-tauri/tauri.conf.json
git commit -m "fix: make mini widget unobtrusive"
```

Expected: commit succeeds.

---

## Self-Review

- Mini mode has a dedicated root class for transparent CSS.
- Full mode still has normal app background and title bar.
- Mini mode hides native title bar with `setDecorations(false)`.
- Tauri window transparency is enabled in config.
- Tests and builds verify the change.
