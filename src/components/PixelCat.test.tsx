import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PixelCat } from './PixelCat';

describe('PixelCat', () => {
  it('renders an accessible pet button with the SVG cat', () => {
    render(<PixelCat mode="focus" message={null} onPet={vi.fn()} />);

    const button = screen.getByRole('button', { name: '摸摸猫猫' });

    expect(button).toHaveClass('pixel-cat', 'pixel-cat-focus');
    expect(button.querySelector('svg.cat-svg')).toBeInTheDocument();
  });

  it('keeps showing the message bubble', () => {
    render(<PixelCat mode="break" message="喵，我在陪你。" onPet={vi.fn()} />);

    expect(screen.getByText('喵，我在陪你。')).toHaveClass('cat-bubble');
  });

  it('calls onPet when clicked', () => {
    const onPet = vi.fn();
    render(<PixelCat mode="focusComplete" message={null} onPet={onPet} />);

    fireEvent.click(screen.getByRole('button', { name: '摸摸猫猫' }));

    expect(onPet).toHaveBeenCalledTimes(1);
  });
});
