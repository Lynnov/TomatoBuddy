# Cat Pomodoro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Windows-first pixel cat desktop pomodoro app with a main window, mini widget mode, focus/break timers, gentle in-app reminders, fish rewards, daily stats, session restore, and light cat interaction.

**Architecture:** Use Tauri v2 as the desktop shell and React + TypeScript as the UI. Keep timer, stats, persistence, and desktop-window behavior in focused modules so they can be tested independently before UI integration.

**Tech Stack:** Tauri v2, React, TypeScript, Vite, Vitest, React Testing Library, CSS modules or plain CSS, browser `localStorage`, Web Audio API, `@tauri-apps/api/window`.

---

## File Structure

Create this structure from the empty `E:\Code\TomatoBuddy` project:

```text
package.json
index.html
vite.config.ts
tsconfig.json
tsconfig.node.json
vitest.setup.ts
src-tauri/Cargo.toml
src-tauri/tauri.conf.json
src-tauri/src/main.rs
src/main.tsx
src/App.tsx
src/App.test.tsx
src/styles.css
src/domain/types.ts
src/domain/presets.ts
src/domain/time.ts
src/domain/time.test.ts
src/domain/timer.ts
src/domain/timer.test.ts
src/domain/stats.ts
src/domain/stats.test.ts
src/domain/restore.ts
src/domain/restore.test.ts
src/services/storage.ts
src/services/storage.test.ts
src/services/sound.ts
src/services/windowControl.ts
src/components/PixelCat.tsx
src/components/TimerDisplay.tsx
src/components/ReminderCard.tsx
src/components/SettingsPanel.tsx
src/components/MiniWidget.tsx
```

Responsibilities:

- `src/domain/*`: pure business logic, no browser or Tauri dependencies.
- `src/services/*`: browser/Tauri integration wrappers.
- `src/components/*`: focused UI components.
- `src/App.tsx`: application state orchestration.
- `src/styles.css`: complete pixel desktop visual style.
- `src-tauri/*`: desktop shell configuration.

---

### Task 1: Bootstrap Tauri React project

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vitest.setup.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/src/main.rs`

- [ ] **Step 1: Initialize git repository**

Run:

```bash
git init
```

Expected: repository initialized in `E:\Code\TomatoBuddy`.

- [ ] **Step 2: Create `package.json`**

Write:

```json
{
  "name": "tomato-buddy",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "tauri": "tauri"
  },
  "dependencies": {
    "@tauri-apps/api": "latest",
    "@vitejs/plugin-react": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@tauri-apps/cli": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "jsdom": "latest",
    "typescript": "latest",
    "vite": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 3: Create Vite and TypeScript config**

Write `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
});
```

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vitest/globals", "vitest/jsdom"]
  },
  "include": ["src", "vitest.setup.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Write `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

Write `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Create initial HTML and React entry**

Write `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TomatoBuddy</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Write `src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Write `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <h1>TomatoBuddy</h1>
      <p>猫猫已经坐好，等你开始啦。</p>
    </main>
  );
}
```

Write `src/styles.css`:

```css
:root {
  color: #3a2a1c;
  background: #f6e8c8;
  font-family: "Trebuchet MS", "Microsoft YaHei", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: #f6e8c8;
}

button,
input,
select {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}
```

- [ ] **Step 5: Create Tauri shell files**

Write `src-tauri/Cargo.toml`:

```toml
[package]
name = "tomato-buddy"
version = "0.1.0"
description = "A pixel cat pomodoro desktop companion"
authors = ["TomatoBuddy"]
edition = "2021"

[lib]
name = "tomato_buddy_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

Write `src-tauri/src/main.rs`:

```rust
fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running TomatoBuddy");
}
```

Write `src-tauri/tauri.conf.json`:

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "TomatoBuddy",
  "version": "0.1.0",
  "identifier": "com.tomatobuddy.app",
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "TomatoBuddy",
        "width": 380,
        "height": 560,
        "minWidth": 280,
        "minHeight": 220,
        "resizable": true,
        "decorations": true,
        "alwaysOnTop": true
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": []
  }
}
```

- [ ] **Step 6: Install dependencies**

Run:

```bash
npm install
```

Expected: `node_modules` and `package-lock.json` created successfully.

- [ ] **Step 7: Verify bootstrap**

Run:

```bash
npm test
npm run build
```

Expected: test command exits successfully with no tests or passing test suite; build creates `dist`.

- [ ] **Step 8: Commit bootstrap**

Run:

```bash
git add package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.node.json vitest.setup.ts src src-tauri
 git commit -m "chore: bootstrap tomato buddy app"
```

Expected: commit succeeds.

---

### Task 2: Add timer domain model

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/presets.ts`
- Create: `src/domain/time.ts`
- Create: `src/domain/time.test.ts`
- Create: `src/domain/timer.ts`
- Create: `src/domain/timer.test.ts`

- [ ] **Step 1: Write time formatting tests**

Write `src/domain/time.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatDuration, clampMinutes } from './time';

describe('formatDuration', () => {
  it('formats seconds as mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(65)).toBe('01:05');
    expect(formatDuration(1500)).toBe('25:00');
  });

  it('does not display negative time', () => {
    expect(formatDuration(-3)).toBe('00:00');
  });
});

describe('clampMinutes', () => {
  it('keeps custom focus and break minutes inside allowed ranges', () => {
    expect(clampMinutes(0, 'focus')).toBe(1);
    expect(clampMinutes(240, 'focus')).toBe(180);
    expect(clampMinutes(0, 'break')).toBe(1);
    expect(clampMinutes(90, 'break')).toBe(60);
  });
});
```

- [ ] **Step 2: Run time tests and verify failure**

Run:

```bash
npm test -- src/domain/time.test.ts
```

Expected: FAIL because `src/domain/time.ts` does not exist.

- [ ] **Step 3: Implement time helpers**

Write `src/domain/time.ts`:

```ts
export type DurationKind = 'focus' | 'break';

export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function clampMinutes(value: number, kind: DurationKind): number {
  const max = kind === 'focus' ? 180 : 60;
  return Math.min(max, Math.max(1, Math.floor(value)));
}
```

- [ ] **Step 4: Write timer reducer tests**

Write `src/domain/timer.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createInitialTimer, startFocus, pauseTimer, resumeTimer, resetTimer, completeTimer, startBreak, startNextFocus } from './timer';

describe('timer domain', () => {
  it('starts a focus session from idle state', () => {
    const timer = startFocus(createInitialTimer(), 25, 5, 1000);

    expect(timer.mode).toBe('focus');
    expect(timer.status).toBe('running');
    expect(timer.durationSeconds).toBe(1500);
    expect(timer.startedAt).toBe(1000);
  });

  it('pauses and resumes without losing remaining seconds', () => {
    const running = startFocus(createInitialTimer(), 25, 5, 1000);
    const paused = pauseTimer(running, 1300);
    const resumed = resumeTimer(paused, 2000);

    expect(paused.status).toBe('paused');
    expect(paused.remainingSeconds).toBe(1200);
    expect(resumed.status).toBe('running');
    expect(resumed.remainingSeconds).toBe(1200);
    expect(resumed.startedAt).toBe(2000);
  });

  it('moves from focus complete to break only when user starts break', () => {
    const running = startFocus(createInitialTimer(), 25, 5, 1000);
    const completed = completeTimer(running);
    const resting = startBreak(completed, 3000);

    expect(completed.mode).toBe('focusComplete');
    expect(completed.status).toBe('completed');
    expect(resting.mode).toBe('break');
    expect(resting.durationSeconds).toBe(300);
    expect(resting.status).toBe('running');
  });

  it('starts the next focus only when user confirms after break completion', () => {
    const breakComplete = completeTimer(startBreak(completeTimer(startFocus(createInitialTimer(), 25, 5, 1000)), 3000));
    const next = startNextFocus(breakComplete, 25, 5, 4000);

    expect(breakComplete.mode).toBe('breakComplete');
    expect(next.mode).toBe('focus');
    expect(next.status).toBe('running');
  });

  it('resets to idle with selected durations', () => {
    const running = startFocus(createInitialTimer(), 50, 10, 1000);
    const reset = resetTimer(running, 50, 10);

    expect(reset.mode).toBe('idle');
    expect(reset.status).toBe('idle');
    expect(reset.remainingSeconds).toBe(3000);
  });
});
```

- [ ] **Step 5: Run timer tests and verify failure**

Run:

```bash
npm test -- src/domain/timer.test.ts
```

Expected: FAIL because timer functions do not exist.

- [ ] **Step 6: Implement timer types, presets, and reducer helpers**

Write `src/domain/types.ts`:

```ts
export type TimerMode = 'idle' | 'focus' | 'paused' | 'focusComplete' | 'break' | 'breakComplete';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';
export type PresetKey = 'short' | 'standard' | 'deep' | 'custom';
export type WindowMode = 'full' | 'mini';

export interface TimerState {
  mode: TimerMode;
  previousMode: 'focus' | 'break' | null;
  status: TimerStatus;
  focusMinutes: number;
  breakMinutes: number;
  durationSeconds: number;
  remainingSeconds: number;
  startedAt: number | null;
}

export interface UserSettings {
  focusMinutes: number;
  breakMinutes: number;
  preset: PresetKey;
  soundEnabled: boolean;
  alwaysOnTop: boolean;
  restoreSession: boolean;
  defaultMiniMode: boolean;
}

export interface DailyStats {
  date: string;
  completedPomodoros: number;
  focusSeconds: number;
  fishCount: number;
}

export interface UiState {
  windowMode: WindowMode;
  windowPosition: { x: number; y: number } | null;
}
```

Write `src/domain/presets.ts`:

```ts
import type { PresetKey, UserSettings } from './types';

export const PRESETS: Record<Exclude<PresetKey, 'custom'>, { label: string; focusMinutes: number; breakMinutes: number }> = {
  short: { label: '短专注', focusMinutes: 15, breakMinutes: 3 },
  standard: { label: '标准番茄', focusMinutes: 25, breakMinutes: 5 },
  deep: { label: '深度专注', focusMinutes: 50, breakMinutes: 10 },
};

export const defaultSettings: UserSettings = {
  focusMinutes: 25,
  breakMinutes: 5,
  preset: 'standard',
  soundEnabled: true,
  alwaysOnTop: true,
  restoreSession: true,
  defaultMiniMode: false,
};
```

Write `src/domain/timer.ts`:

```ts
import type { TimerState } from './types';

export function createInitialTimer(focusMinutes = 25, breakMinutes = 5): TimerState {
  return {
    mode: 'idle',
    previousMode: null,
    status: 'idle',
    focusMinutes,
    breakMinutes,
    durationSeconds: focusMinutes * 60,
    remainingSeconds: focusMinutes * 60,
    startedAt: null,
  };
}

export function startFocus(state: TimerState, focusMinutes: number, breakMinutes: number, now: number): TimerState {
  return {
    ...state,
    mode: 'focus',
    previousMode: null,
    status: 'running',
    focusMinutes,
    breakMinutes,
    durationSeconds: focusMinutes * 60,
    remainingSeconds: focusMinutes * 60,
    startedAt: now,
  };
}

export function pauseTimer(state: TimerState, now: number): TimerState {
  if (state.status !== 'running' || state.startedAt === null) return state;
  const elapsed = Math.floor((now - state.startedAt) / 1000);
  return {
    ...state,
    mode: 'paused',
    previousMode: state.mode === 'break' ? 'break' : 'focus',
    status: 'paused',
    remainingSeconds: Math.max(0, state.remainingSeconds - elapsed),
    startedAt: null,
  };
}

export function resumeTimer(state: TimerState, now: number): TimerState {
  if (state.status !== 'paused') return state;
  return {
    ...state,
    mode: state.previousMode ?? 'focus',
    status: 'running',
    startedAt: now,
  };
}

export function resetTimer(state: TimerState, focusMinutes: number, breakMinutes: number): TimerState {
  return createInitialTimer(focusMinutes, breakMinutes);
}

export function completeTimer(state: TimerState): TimerState {
  if (state.mode === 'break') {
    return { ...state, mode: 'breakComplete', status: 'completed', remainingSeconds: 0, startedAt: null };
  }
  return { ...state, mode: 'focusComplete', status: 'completed', remainingSeconds: 0, startedAt: null };
}

export function startBreak(state: TimerState, now: number): TimerState {
  return {
    ...state,
    mode: 'break',
    previousMode: null,
    status: 'running',
    durationSeconds: state.breakMinutes * 60,
    remainingSeconds: state.breakMinutes * 60,
    startedAt: now,
  };
}

export function startNextFocus(state: TimerState, focusMinutes: number, breakMinutes: number, now: number): TimerState {
  return startFocus(state, focusMinutes, breakMinutes, now);
}

export function tickTimer(state: TimerState, now: number): TimerState {
  if (state.status !== 'running' || state.startedAt === null) return state;
  const elapsed = Math.floor((now - state.startedAt) / 1000);
  const remainingSeconds = Math.max(0, state.remainingSeconds - elapsed);
  if (remainingSeconds === 0) {
    return completeTimer({ ...state, remainingSeconds: 0 });
  }
  return { ...state, remainingSeconds, startedAt: now };
}
```

- [ ] **Step 7: Run domain timer tests**

Run:

```bash
npm test -- src/domain/time.test.ts src/domain/timer.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit timer domain**

Run:

```bash
git add src/domain
 git commit -m "feat: add pomodoro timer domain"
```

Expected: commit succeeds.

---

### Task 3: Add stats and restore logic

**Files:**
- Create: `src/domain/stats.ts`
- Create: `src/domain/stats.test.ts`
- Create: `src/domain/restore.ts`
- Create: `src/domain/restore.test.ts`

- [ ] **Step 1: Write stats tests**

Write `src/domain/stats.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createDailyStats, addCompletedFocus, ensureTodayStats } from './stats';

describe('daily stats', () => {
  it('creates empty stats for a date', () => {
    expect(createDailyStats('2026-05-11')).toEqual({
      date: '2026-05-11',
      completedPomodoros: 0,
      focusSeconds: 0,
      fishCount: 0,
    });
  });

  it('adds completed focus and fish reward', () => {
    const next = addCompletedFocus(createDailyStats('2026-05-11'), 1500);

    expect(next.completedPomodoros).toBe(1);
    expect(next.focusSeconds).toBe(1500);
    expect(next.fishCount).toBe(1);
  });

  it('resets stats across days', () => {
    const yesterday = addCompletedFocus(createDailyStats('2026-05-10'), 1500);

    expect(ensureTodayStats(yesterday, '2026-05-11')).toEqual(createDailyStats('2026-05-11'));
  });
});
```

- [ ] **Step 2: Implement stats helpers**

Write `src/domain/stats.ts`:

```ts
import type { DailyStats } from './types';

export function createDailyStats(date: string): DailyStats {
  return { date, completedPomodoros: 0, focusSeconds: 0, fishCount: 0 };
}

export function addCompletedFocus(stats: DailyStats, focusSeconds: number): DailyStats {
  return {
    ...stats,
    completedPomodoros: stats.completedPomodoros + 1,
    focusSeconds: stats.focusSeconds + focusSeconds,
    fishCount: stats.fishCount + 1,
  };
}

export function ensureTodayStats(stats: DailyStats | null, today: string): DailyStats {
  if (!stats || stats.date !== today) return createDailyStats(today);
  return stats;
}

export function formatFocusTotal(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  if (hours === 0) return `${restMinutes} 分钟`;
  if (restMinutes === 0) return `${hours} 小时`;
  return `${hours} 小时 ${restMinutes} 分钟`;
}
```

- [ ] **Step 3: Write restore tests**

Write `src/domain/restore.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createInitialTimer, startFocus, pauseTimer } from './timer';
import { restoreTimer } from './restore';

describe('restoreTimer', () => {
  it('restores running focus with elapsed time deducted', () => {
    const state = startFocus(createInitialTimer(), 25, 5, 1000);
    const restored = restoreTimer(state, 61_000);

    expect(restored.mode).toBe('focus');
    expect(restored.status).toBe('running');
    expect(restored.remainingSeconds).toBe(1440);
  });

  it('restores running focus as complete when end time passed', () => {
    const state = startFocus(createInitialTimer(), 25, 5, 1000);
    const restored = restoreTimer(state, 1_600_000);

    expect(restored.mode).toBe('focusComplete');
    expect(restored.status).toBe('completed');
    expect(restored.remainingSeconds).toBe(0);
  });

  it('keeps paused timers paused', () => {
    const paused = pauseTimer(startFocus(createInitialTimer(), 25, 5, 1000), 301_000);
    const restored = restoreTimer(paused, 900_000);

    expect(restored.mode).toBe('paused');
    expect(restored.status).toBe('paused');
    expect(restored.remainingSeconds).toBe(1200);
  });
});
```

- [ ] **Step 4: Implement restore helper**

Write `src/domain/restore.ts`:

```ts
import type { TimerState } from './types';
import { completeTimer } from './timer';

export function restoreTimer(state: TimerState, now: number): TimerState {
  if (state.status !== 'running' || state.startedAt === null) return state;
  const elapsed = Math.floor((now - state.startedAt) / 1000);
  const remainingSeconds = Math.max(0, state.remainingSeconds - elapsed);
  if (remainingSeconds === 0) {
    return completeTimer({ ...state, remainingSeconds: 0, startedAt: null });
  }
  return { ...state, remainingSeconds, startedAt: now };
}
```

- [ ] **Step 5: Run stats and restore tests**

Run:

```bash
npm test -- src/domain/stats.test.ts src/domain/restore.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit stats and restore logic**

Run:

```bash
git add src/domain
 git commit -m "feat: add stats and restore logic"
```

Expected: commit succeeds.

---

### Task 4: Add persistence services

**Files:**
- Create: `src/services/storage.ts`
- Create: `src/services/storage.test.ts`

- [ ] **Step 1: Write storage tests**

Write `src/services/storage.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { loadAppStorage, saveAppStorage } from './storage';
import { createInitialTimer } from '../domain/timer';
import { defaultSettings } from '../domain/presets';
import { createDailyStats } from '../domain/stats';

describe('storage service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when localStorage is empty', () => {
    const today = '2026-05-11';
    const data = loadAppStorage(today);

    expect(data.settings).toEqual(defaultSettings);
    expect(data.timer).toEqual(createInitialTimer());
    expect(data.stats).toEqual(createDailyStats(today));
    expect(data.ui.windowMode).toBe('full');
  });

  it('saves and loads app storage', () => {
    const today = '2026-05-11';
    const data = {
      settings: { ...defaultSettings, focusMinutes: 50, breakMinutes: 10, preset: 'deep' as const },
      timer: createInitialTimer(50, 10),
      stats: createDailyStats(today),
      ui: { windowMode: 'mini' as const, windowPosition: { x: 10, y: 20 } },
    };

    saveAppStorage(data);

    expect(loadAppStorage(today)).toEqual(data);
  });
});
```

- [ ] **Step 2: Implement storage service**

Write `src/services/storage.ts`:

```ts
import { defaultSettings } from '../domain/presets';
import { createDailyStats, ensureTodayStats } from '../domain/stats';
import { createInitialTimer } from '../domain/timer';
import type { DailyStats, TimerState, UiState, UserSettings } from '../domain/types';

const STORAGE_KEY = 'tomato-buddy:v1';

export interface AppStorageData {
  settings: UserSettings;
  timer: TimerState;
  stats: DailyStats;
  ui: UiState;
}

export function loadAppStorage(today: string): AppStorageData {
  const fallback: AppStorageData = {
    settings: defaultSettings,
    timer: createInitialTimer(),
    stats: createDailyStats(today),
    ui: { windowMode: 'full', windowPosition: null },
  };

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as Partial<AppStorageData>;
    const settings = { ...defaultSettings, ...parsed.settings };
    return {
      settings,
      timer: parsed.timer ?? createInitialTimer(settings.focusMinutes, settings.breakMinutes),
      stats: ensureTodayStats(parsed.stats ?? null, today),
      ui: parsed.ui ?? fallback.ui,
    };
  } catch {
    return fallback;
  }
}

export function saveAppStorage(data: AppStorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
```

- [ ] **Step 3: Run storage tests**

Run:

```bash
npm test -- src/services/storage.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit persistence service**

Run:

```bash
git add src/services src/domain
 git commit -m "feat: add app persistence"
```

Expected: commit succeeds.

---

### Task 5: Add window and sound services

**Files:**
- Create: `src/services/windowControl.ts`
- Create: `src/services/sound.ts`

- [ ] **Step 1: Implement Tauri-safe window control wrapper**

Write `src/services/windowControl.ts`:

```ts
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
```

- [ ] **Step 2: Implement gentle sound service**

Write `src/services/sound.ts`:

```ts
export function playGentleChime(enabled: boolean): void {
  if (!enabled) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
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
  oscillator.start();
  oscillator.stop(context.currentTime + 0.34);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
```

- [ ] **Step 3: Run typecheck build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit desktop services**

Run:

```bash
git add src/services
 git commit -m "feat: add desktop window and sound services"
```

Expected: commit succeeds.

---

### Task 6: Build focused UI components

**Files:**
- Create: `src/components/TimerDisplay.tsx`
- Create: `src/components/ReminderCard.tsx`
- Create: `src/components/PixelCat.tsx`
- Create: `src/components/SettingsPanel.tsx`
- Create: `src/components/MiniWidget.tsx`

- [ ] **Step 1: Create timer display**

Write `src/components/TimerDisplay.tsx`:

```tsx
import { formatDuration } from '../domain/time';
import type { TimerMode } from '../domain/types';

const labels: Record<TimerMode, string> = {
  idle: '猫猫已经坐好',
  focus: '专注陪伴中',
  paused: '暂停中',
  focusComplete: '专注完成',
  break: '和猫猫休息中',
  breakComplete: '休息完成',
};

interface TimerDisplayProps {
  mode: TimerMode;
  remainingSeconds: number;
}

export function TimerDisplay({ mode, remainingSeconds }: TimerDisplayProps) {
  return (
    <section className="timer-display" aria-label="计时状态">
      <p className="timer-mode">{labels[mode]}</p>
      <p className="timer-time">{formatDuration(remainingSeconds)}</p>
    </section>
  );
}
```

- [ ] **Step 2: Create reminder card**

Write `src/components/ReminderCard.tsx`:

```tsx
import type { TimerMode } from '../domain/types';

interface ReminderCardProps {
  mode: TimerMode;
  onPrimary: () => void;
  onDismiss: () => void;
}

export function ReminderCard({ mode, onPrimary, onDismiss }: ReminderCardProps) {
  if (mode !== 'focusComplete' && mode !== 'breakComplete') return null;

  const focusComplete = mode === 'focusComplete';

  return (
    <aside className="reminder-card" role="dialog" aria-live="polite">
      <strong>{focusComplete ? '太棒了！' : '猫猫伸了个懒腰。'}</strong>
      <p>{focusComplete ? '猫猫奖励你一条小鱼干。' : '要开始下一轮了吗？'}</p>
      <div className="reminder-actions">
        <button type="button" onClick={onPrimary}>{focusComplete ? '开始休息' : '开始下一轮'}</button>
        <button type="button" className="secondary" onClick={onDismiss}>稍后</button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Create pixel cat component**

Write `src/components/PixelCat.tsx`:

```tsx
import type { TimerMode } from '../domain/types';

interface PixelCatProps {
  mode: TimerMode;
  message: string | null;
  onPet: () => void;
}

export function PixelCat({ mode, message, onPet }: PixelCatProps) {
  return (
    <button type="button" className={`pixel-cat pixel-cat-${mode}`} onClick={onPet} aria-label="摸摸猫猫">
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

- [ ] **Step 4: Create settings panel**

Write `src/components/SettingsPanel.tsx`:

```tsx
import { PRESETS } from '../domain/presets';
import { clampMinutes } from '../domain/time';
import type { PresetKey, UserSettings } from '../domain/types';

interface SettingsPanelProps {
  settings: UserSettings;
  onChange: (settings: UserSettings) => void;
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  function applyPreset(preset: PresetKey) {
    if (preset === 'custom') {
      onChange({ ...settings, preset });
      return;
    }
    const next = PRESETS[preset];
    onChange({ ...settings, preset, focusMinutes: next.focusMinutes, breakMinutes: next.breakMinutes });
  }

  return (
    <section className="settings-panel" aria-label="设置">
      <label>
        专注模式
        <select value={settings.preset} onChange={(event) => applyPreset(event.target.value as PresetKey)}>
          <option value="short">短专注：15 / 3</option>
          <option value="standard">标准番茄：25 / 5</option>
          <option value="deep">深度专注：50 / 10</option>
          <option value="custom">自定义</option>
        </select>
      </label>
      <label>
        专注分钟
        <input type="number" min="1" max="180" value={settings.focusMinutes} onChange={(event) => onChange({ ...settings, preset: 'custom', focusMinutes: clampMinutes(Number(event.target.value), 'focus') })} />
      </label>
      <label>
        休息分钟
        <input type="number" min="1" max="60" value={settings.breakMinutes} onChange={(event) => onChange({ ...settings, preset: 'custom', breakMinutes: clampMinutes(Number(event.target.value), 'break') })} />
      </label>
      <label className="toggle-row">
        <input type="checkbox" checked={settings.soundEnabled} onChange={(event) => onChange({ ...settings, soundEnabled: event.target.checked })} />
        声音提醒
      </label>
      <label className="toggle-row">
        <input type="checkbox" checked={settings.alwaysOnTop} onChange={(event) => onChange({ ...settings, alwaysOnTop: event.target.checked })} />
        窗口置顶
      </label>
      <label className="toggle-row">
        <input type="checkbox" checked={settings.restoreSession} onChange={(event) => onChange({ ...settings, restoreSession: event.target.checked })} />
        启动时恢复上次计时
      </label>
    </section>
  );
}
```

- [ ] **Step 5: Create mini widget**

Write `src/components/MiniWidget.tsx`:

```tsx
import { formatDuration } from '../domain/time';
import type { TimerMode } from '../domain/types';
import { PixelCat } from './PixelCat';

interface MiniWidgetProps {
  mode: TimerMode;
  remainingSeconds: number;
  message: string | null;
  onPet: () => void;
  onExpand: () => void;
}

export function MiniWidget({ mode, remainingSeconds, message, onPet, onExpand }: MiniWidgetProps) {
  return (
    <main className="mini-widget" onDoubleClick={onExpand}>
      <PixelCat mode={mode} message={message} onPet={onPet} />
      <strong>{formatDuration(remainingSeconds)}</strong>
    </main>
  );
}
```

- [ ] **Step 6: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit UI components**

Run:

```bash
git add src/components
 git commit -m "feat: add pixel pomodoro components"
```

Expected: commit succeeds.

---

### Task 7: Integrate app state and behavior

**Files:**
- Modify: `src/App.tsx`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write integration tests**

Write `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-11T10:00:00+08:00'));
});

describe('App', () => {
  it('starts, completes focus, and awards a fish', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);

    await user.click(screen.getByRole('button', { name: '开始专注' }));
    vi.advanceTimersByTime(25 * 60 * 1000);

    expect(await screen.findByText('猫猫奖励你一条小鱼干。')).toBeInTheDocument();
    expect(screen.getByText('今日小鱼干：1 条')).toBeInTheDocument();
  });

  it('pets the cat without changing the timer', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);

    await user.click(screen.getByRole('button', { name: '摸摸猫猫' }));

    expect(screen.getByText(/喵|坚持|喝水|安静/)).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run integration tests and verify failure**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because `App.tsx` does not yet implement the product flow.

- [ ] **Step 3: Implement `App.tsx`**

Replace `src/App.tsx` with:

```tsx
import { useEffect, useMemo, useState } from 'react';
import { PixelCat } from './components/PixelCat';
import { ReminderCard } from './components/ReminderCard';
import { SettingsPanel } from './components/SettingsPanel';
import { TimerDisplay } from './components/TimerDisplay';
import { MiniWidget } from './components/MiniWidget';
import { defaultSettings } from './domain/presets';
import { addCompletedFocus, formatFocusTotal } from './domain/stats';
import { completeTimer, createInitialTimer, pauseTimer, resetTimer, resumeTimer, startBreak, startFocus, startNextFocus, tickTimer } from './domain/timer';
import type { TimerState, UiState, UserSettings } from './domain/types';
import { restoreTimer } from './domain/restore';
import { loadAppStorage, saveAppStorage } from './services/storage';
import { playGentleChime } from './services/sound';
import { applyWindowMode } from './services/windowControl';

const petMessages = ['喵，我在陪你。', '再坚持一下下。', '别忘了喝水。', '我会安静一点。'];

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const initial = useMemo(() => loadAppStorage(todayString()), []);
  const [settings, setSettings] = useState<UserSettings>(initial.settings);
  const [timer, setTimer] = useState<TimerState>(() => initial.settings.restoreSession ? restoreTimer(initial.timer, Date.now()) : createInitialTimer(initial.settings.focusMinutes, initial.settings.breakMinutes));
  const [stats, setStats] = useState(initial.stats);
  const [ui, setUi] = useState<UiState>(() => ({ ...initial.ui, windowMode: initial.settings.defaultMiniMode ? 'mini' : initial.ui.windowMode }));
  const [catMessage, setCatMessage] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimer((current) => {
        const next = tickTimer(current, Date.now());
        if (current.mode === 'focus' && next.mode === 'focusComplete') {
          setStats((currentStats) => addCompletedFocus(currentStats, current.durationSeconds));
          playGentleChime(settings.soundEnabled);
        }
        if (current.mode === 'break' && next.mode === 'breakComplete') {
          playGentleChime(settings.soundEnabled);
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [settings.soundEnabled]);

  useEffect(() => {
    saveAppStorage({ settings, timer, stats, ui });
  }, [settings, timer, stats, ui]);

  useEffect(() => {
    void applyWindowMode(ui.windowMode, settings.alwaysOnTop);
  }, [ui.windowMode, settings.alwaysOnTop]);

  function petCat() {
    const next = petMessages[Math.floor(Math.random() * petMessages.length)];
    setCatMessage(next);
    window.setTimeout(() => setCatMessage(null), 1800);
  }

  function primaryActionLabel() {
    if (timer.status === 'running') return timer.mode === 'break' ? '暂停休息' : '暂停';
    if (timer.status === 'paused') return '继续';
    return '开始专注';
  }

  function runPrimaryAction() {
    if (timer.status === 'running') {
      setTimer(pauseTimer(timer, Date.now()));
      return;
    }
    if (timer.status === 'paused') {
      setTimer(resumeTimer(timer, Date.now()));
      return;
    }
    setTimer(startFocus(timer, settings.focusMinutes, settings.breakMinutes, Date.now()));
  }

  function dismissReminder() {
    setTimer((current) => ({ ...current, status: 'completed' }));
  }

  if (ui.windowMode === 'mini') {
    return (
      <MiniWidget
        mode={timer.mode}
        remainingSeconds={timer.remainingSeconds}
        message={catMessage}
        onPet={petCat}
        onExpand={() => setUi({ ...ui, windowMode: 'full' })}
      />
    );
  }

  return (
    <main className="app-shell">
      <section className="buddy-card">
        <header className="app-header">
          <h1>TomatoBuddy</h1>
          <button type="button" className="ghost-button" onClick={() => setSettingsOpen((open) => !open)}>设置</button>
        </header>

        <PixelCat mode={timer.mode} message={catMessage} onPet={petCat} />
        <TimerDisplay mode={timer.mode} remainingSeconds={timer.remainingSeconds} />

        <section className="stats-row" aria-label="今日统计">
          <span>今日小鱼干：{stats.fishCount} 条</span>
          <span>今日专注：{formatFocusTotal(stats.focusSeconds)}</span>
        </section>

        <div className="control-row">
          <button type="button" onClick={runPrimaryAction}>{primaryActionLabel()}</button>
          <button type="button" className="secondary" onClick={() => setTimer(resetTimer(timer, settings.focusMinutes, settings.breakMinutes))}>重置</button>
        </div>

        <button type="button" className="mini-toggle" onClick={() => setUi({ ...ui, windowMode: 'mini' })}>切换迷你挂件</button>

        {settingsOpen && <SettingsPanel settings={settings} onChange={setSettings} />}

        <ReminderCard
          mode={timer.mode}
          onDismiss={dismissReminder}
          onPrimary={() => {
            if (timer.mode === 'focusComplete') setTimer(startBreak(timer, Date.now()));
            if (timer.mode === 'breakComplete') setTimer(startNextFocus(timer, settings.focusMinutes, settings.breakMinutes, Date.now()));
          }}
        />
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Run integration tests**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit app integration**

Run:

```bash
git add src/App.tsx src/App.test.tsx
 git commit -m "feat: integrate pomodoro companion flow"
```

Expected: commit succeeds.

---

### Task 8: Apply pixel desktop styling

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Replace styles with pixel desktop theme**

Replace `src/styles.css` with:

```css
:root {
  color: #3a2a1c;
  background: #f6e8c8;
  font-family: "Trebuchet MS", "Microsoft YaHei", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 180px;
  min-height: 150px;
  background: radial-gradient(circle at 20% 10%, #fff4d7 0 18%, transparent 19%), #f6e8c8;
}

button,
input,
select {
  font: inherit;
}

button {
  border: 3px solid #3a2a1c;
  background: #ffd166;
  color: #3a2a1c;
  padding: 10px 14px;
  border-radius: 0;
  box-shadow: 4px 4px 0 #3a2a1c;
  cursor: pointer;
}

button:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #3a2a1c;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
}

.buddy-card {
  position: relative;
  width: min(340px, 100%);
  border: 4px solid #3a2a1c;
  background: #fff4d7;
  padding: 18px;
  box-shadow: 8px 8px 0 #c77738;
}

.app-header,
.control-row,
.stats-row,
.reminder-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.app-header h1 {
  margin: 0;
  font-size: 24px;
  letter-spacing: 0.04em;
}

.ghost-button,
.secondary,
.mini-toggle {
  background: #fff4d7;
}

.pixel-cat {
  position: relative;
  display: block;
  width: 132px;
  height: 118px;
  margin: 28px auto 18px;
  border: 0;
  background: transparent;
  box-shadow: none;
  padding: 0;
  animation: cat-bob 1.8s steps(2, end) infinite;
}

.pixel-cat:active {
  transform: none;
  box-shadow: none;
}

.cat-face {
  position: absolute;
  left: 24px;
  top: 28px;
  width: 84px;
  height: 70px;
  background: #f5a65b;
  border: 4px solid #3a2a1c;
  box-shadow: inset -10px -8px 0 #e88d45;
}

.cat-ear {
  position: absolute;
  top: 8px;
  width: 32px;
  height: 32px;
  background: #f5a65b;
  border: 4px solid #3a2a1c;
  transform: rotate(45deg);
}

.cat-ear-left { left: 26px; }
.cat-ear-right { right: 26px; }

.cat-eye {
  position: absolute;
  top: 24px;
  width: 10px;
  height: 14px;
  background: #3a2a1c;
  animation: cat-blink 4s steps(1, end) infinite;
}

.cat-eye-left { left: 22px; }
.cat-eye-right { right: 22px; }

.cat-mouth {
  position: absolute;
  left: 36px;
  top: 46px;
  width: 12px;
  height: 6px;
  border-bottom: 4px solid #3a2a1c;
}

.cat-tail {
  position: absolute;
  right: 2px;
  top: 54px;
  width: 34px;
  height: 18px;
  border: 4px solid #3a2a1c;
  border-left: 0;
  animation: tail-wag 1.2s steps(2, end) infinite;
}

.cat-bubble {
  position: absolute;
  left: 92px;
  top: -14px;
  width: 130px;
  background: #ffffff;
  border: 3px solid #3a2a1c;
  padding: 8px;
  font-size: 13px;
  box-shadow: 4px 4px 0 #3a2a1c;
}

.timer-display {
  text-align: center;
}

.timer-mode {
  margin: 0;
  font-weight: 700;
}

.timer-time {
  margin: 6px 0 16px;
  font-size: 48px;
  line-height: 1;
  letter-spacing: 0.04em;
}

.stats-row {
  flex-direction: column;
  align-items: stretch;
  margin: 14px 0;
  font-size: 14px;
}

.control-row button {
  flex: 1;
}

.mini-toggle {
  width: 100%;
  margin-top: 14px;
}

.settings-panel {
  display: grid;
  gap: 10px;
  margin-top: 16px;
  padding: 12px;
  border: 3px solid #3a2a1c;
  background: #f9df9b;
}

.settings-panel label {
  display: grid;
  gap: 4px;
}

.toggle-row {
  display: flex !important;
  grid-template-columns: auto 1fr;
  align-items: center;
}

.reminder-card {
  position: absolute;
  inset: auto 14px 14px;
  border: 4px solid #3a2a1c;
  background: #d6f0d2;
  padding: 14px;
  box-shadow: 6px 6px 0 #3a2a1c;
}

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

.mini-widget .pixel-cat {
  transform: scale(0.7);
  margin: -10px auto -6px;
}

.mini-widget strong {
  font-size: 24px;
}

@keyframes cat-bob {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -4px; }
}

@keyframes cat-blink {
  0%, 92%, 100% { height: 14px; }
  94% { height: 3px; }
}

@keyframes tail-wag {
  0%, 100% { rotate: 0deg; }
  50% { rotate: 8deg; }
}
```

- [ ] **Step 2: Run tests and build**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 3: Commit styling**

Run:

```bash
git add src/styles.css
 git commit -m "style: add pixel cat desktop theme"
```

Expected: commit succeeds.

---

### Task 9: Verify desktop behavior manually

**Files:**
- Modify only if verification finds a defect in existing files.

- [ ] **Step 1: Run all automated checks**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 2: Start web dev server for UI smoke test**

Run:

```bash
npm run dev
```

Expected: Vite starts on `http://localhost:5173`.

Manual checks in browser:

1. App opens with idle cat and `25:00`.
2. Clicking `开始专注` starts the timer.
3. Clicking cat shows a short bubble and timer remains unchanged.
4. Clicking `设置` opens preset and custom duration controls.
5. Changing to `短专注` updates duration to `15:00` after reset.
6. Clicking `切换迷你挂件` shows mini layout.

- [ ] **Step 3: Start Tauri dev app**

Run:

```bash
npm run tauri dev
```

Expected: desktop window opens.

Manual checks in desktop app:

1. Window opens as TomatoBuddy.
2. Window is small and usable on Windows.
3. `切换迷你挂件` resizes the window.
4. Double-clicking mini widget expands through UI behavior if implemented by webview event.
5. Timer continues while window remains open.
6. Closing and reopening restores persisted state through localStorage.

- [ ] **Step 4: Build desktop bundle**

Run:

```bash
npm run tauri build
```

Expected: Tauri release build succeeds and creates Windows bundle artifacts under `src-tauri/target/release/bundle`.

- [ ] **Step 5: Commit verification fixes or final state**

If verification changed files, run:

```bash
git add src src-tauri package.json package-lock.json
 git commit -m "fix: polish desktop companion behavior"
```

If no files changed, run:

```bash
git status --short
```

Expected: no source changes except existing docs if they were not committed earlier.

---

## Self-Review

### Spec coverage

- Windows-first desktop shell: Task 1, Task 9.
- Main window and mini widget: Task 6, Task 7, Task 8.
- Focus/break timer: Task 2, Task 7.
- Presets and custom duration: Task 2, Task 6, Task 7.
- In-app reminder cards: Task 6, Task 7.
- Gentle sound: Task 5, Task 7.
- Daily fish count and focus total: Task 3, Task 7.
- Restart/session restore: Task 3, Task 4, Task 7.
- Cat light interaction: Task 6, Task 7, Task 8.
- Pixel visual style: Task 8.
- Manual desktop verification: Task 9.

### Placeholder scan

The plan contains no TBD, TODO, or undefined implementation steps. Each code-writing step includes exact target paths and complete code for that step.

### Type consistency

Shared types come from `src/domain/types.ts`. Later tasks consistently use `TimerState`, `UserSettings`, `DailyStats`, `UiState`, `TimerMode`, `WindowMode`, and `PresetKey` from that file.
