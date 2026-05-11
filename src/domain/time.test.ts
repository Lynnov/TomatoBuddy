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
