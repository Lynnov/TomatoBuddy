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
    vi.useRealTimers();
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
    vi.useFakeTimers();
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
    vi.runAllTimers();

    expect(onPet).toHaveBeenCalledTimes(1);
  });

  it('expands without petting when double clicking the cat', () => {
    vi.useFakeTimers();
    const onPet = vi.fn();
    const onExpand = vi.fn();
    render(
      <MiniWidget
        mode="focus"
        remainingSeconds={1500}
        message={null}
        onPet={onPet}
        onExpand={onExpand}
      />,
    );

    const cat = screen.getByRole('button', { name: '摸摸猫猫' });
    fireEvent.click(cat);
    fireEvent.click(cat);
    fireEvent.doubleClick(cat);
    vi.runAllTimers();

    expect(onExpand).toHaveBeenCalledTimes(1);
    expect(onPet).not.toHaveBeenCalled();
  });

  it('expands without petting when double clicking the cat slowly', () => {
    vi.useFakeTimers();
    const onPet = vi.fn();
    const onExpand = vi.fn();
    render(
      <MiniWidget
        mode="focus"
        remainingSeconds={1500}
        message={null}
        onPet={onPet}
        onExpand={onExpand}
      />,
    );

    const cat = screen.getByRole('button', { name: '摸摸猫猫' });
    fireEvent.click(cat);
    vi.advanceTimersByTime(250);
    fireEvent.click(cat);
    fireEvent.doubleClick(cat);
    vi.runAllTimers();

    expect(onExpand).toHaveBeenCalledTimes(1);
    expect(onPet).not.toHaveBeenCalled();
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
