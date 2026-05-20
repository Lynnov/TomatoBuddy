import { useEffect, useMemo, useState } from 'react';
import { PixelCat } from './components/PixelCat';
import { ReminderCard } from './components/ReminderCard';
import { SettingsPanel } from './components/SettingsPanel';
import { TimerDisplay } from './components/TimerDisplay';
import { MiniWidget } from './components/MiniWidget';
import { addCompletedFocus, ensureTodayStats, formatFocusTotal } from './domain/stats';
import { createInitialTimer, pauseTimer, resetTimer, resumeTimer, startBreak, startFocus, startNextFocus, tickTimer } from './domain/timer';
import type { TimerState, UiState, UserSettings } from './domain/types';
import { restoreTimer } from './domain/restore';
import { loadAppStorage, saveAppStorage } from './services/storage';
import { playGentleChime } from './services/sound';
import { applyWindowMode } from './services/windowControl';

const petMessages = ['喵，我在陪你。', '再坚持一下下。', '别忘了喝水。', '我会安静一点。'];

function todayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
          setStats((currentStats) => addCompletedFocus(ensureTodayStats(currentStats, todayString()), current.durationSeconds));
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

  useEffect(() => {
    document.documentElement.classList.toggle('is-mini-mode', ui.windowMode === 'mini');
    document.documentElement.classList.toggle('is-full-mode', ui.windowMode === 'full');
    return () => {
      document.documentElement.classList.remove('is-mini-mode', 'is-full-mode');
    };
  }, [ui.windowMode]);

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
