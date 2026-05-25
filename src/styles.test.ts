import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');

const getRuleBlock = (selector: string) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));

  expect(match, `Expected CSS rule for ${selector}`).not.toBeNull();

  return match?.[1] ?? '';
};

describe('mini widget styles', () => {
  it('keeps mini mode transparent and visually minimal', () => {
    const miniBodyBlock = getRuleBlock('.is-mini-mode body');
    const miniWidgetBlock = getRuleBlock('.is-mini-mode .mini-widget');
    const baseMiniWidgetBlock = getRuleBlock('.mini-widget');

    expect(miniBodyBlock).toContain('background: transparent');
    expect(baseMiniWidgetBlock).toContain('position: relative');
    expect(miniWidgetBlock).toContain('border: 0');
    expect(miniWidgetBlock).toContain('box-shadow: none');
    expect(miniWidgetBlock).toContain('padding: 4px');
    expect(miniWidgetBlock).not.toContain('background: rgba(255, 244, 215, 0.94)');
    expect(miniWidgetBlock).not.toContain('box-shadow: 6px 6px 0 #c77738');
  });

  it('keeps mini time readable on light and dark backgrounds', () => {
    const miniTimeBlock = getRuleBlock('.is-mini-mode .mini-time');

    expect(miniTimeBlock).toContain('color: #fff4d7');
    expect(miniTimeBlock).toContain('text-shadow:');
    expect(miniTimeBlock).toContain('#3a2a1c');
    expect(miniTimeBlock).toContain('#ffffff');
  });

  it('sizes the SVG cat and keeps mini frame outside the cat as the drag affordance', () => {
    const catBlock = getRuleBlock('.pixel-cat');
    const catSvgBlock = getRuleBlock('.cat-svg');
    const miniWidgetBlock = getRuleBlock('.is-mini-mode .mini-widget');
    const miniCatBlock = getRuleBlock('.is-mini-mode .mini-widget .pixel-cat');
    const miniBubbleBlock = getRuleBlock('.is-mini-mode .mini-widget .cat-bubble');

    expect(css).not.toContain('.mini-drag-handle');
    expect(css).not.toContain('.cat-face');
    expect(css).not.toContain('.cat-ear');
    expect(css).not.toContain('.cat-eye');
    expect(css).not.toContain('.cat-mouth');
    expect(css).not.toContain('.cat-tail');
    expect(css).not.toContain('cat-bob');
    expect(css).not.toContain('cat-blink');
    expect(css).not.toContain('tail-wag');
    expect(catBlock).toContain('width: 180px');
    expect(catBlock).toContain('height: 180px');
    expect(catBlock).toContain('background: transparent');
    expect(catBlock).toContain('border: 0');
    expect(catBlock).toContain('box-shadow: none');
    expect(catBlock).toContain('animation: cat-idle 2.4s ease-in-out infinite');
    expect(catSvgBlock).toContain('width: 100%');
    expect(catSvgBlock).toContain('height: 100%');
    expect(catSvgBlock).toContain('overflow: visible');
    expect(catSvgBlock).toContain('filter: drop-shadow(');
    expect(miniWidgetBlock).toContain('cursor: grab');
    expect(miniCatBlock).toContain('width: 132px');
    expect(miniCatBlock).toContain('height: 118px');
    expect(miniCatBlock).toContain('transform: scale(0.7)');
    expect(miniCatBlock).not.toContain('width: 126px');
    expect(miniCatBlock).not.toContain('height: 126px');
    expect(miniCatBlock).not.toContain('margin: -12px auto -10px');
    expect(miniCatBlock).toContain('cursor: pointer');
    expect(miniBubbleBlock).toContain('left: 50%');
    expect(miniBubbleBlock).toContain('top: 118px');
    expect(miniBubbleBlock).toContain('width: 132px');
    expect(miniBubbleBlock).toContain('transform: translateX(-50%)');
    expect(miniBubbleBlock).not.toContain('top: 0');
    expect(miniBubbleBlock).not.toContain('left: 92px');
  });
});
