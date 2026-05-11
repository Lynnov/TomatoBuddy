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
