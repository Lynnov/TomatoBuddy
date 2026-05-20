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
