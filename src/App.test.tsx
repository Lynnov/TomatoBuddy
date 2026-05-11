import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-11T10:00:00+08:00'));
});

describe('App', () => {
  it('starts, completes focus, and awards a fish', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '开始专注' }));
    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1000);
    });

    expect(screen.getByText('猫猫奖励你一条小鱼干。')).toBeInTheDocument();
    expect(screen.getByText('今日小鱼干：1 条')).toBeInTheDocument();
  });

  it('pets the cat without changing the timer', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '摸摸猫猫' }));

    expect(screen.getByText(/喵|坚持|喝水|安静/)).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });
});
