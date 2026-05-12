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

    expect(miniBodyBlock).toContain('background: transparent');
    expect(miniWidgetBlock).toContain('border: 0');
    expect(miniWidgetBlock).toContain('box-shadow: none');
    expect(miniWidgetBlock).toContain('padding: 4px');
    expect(miniWidgetBlock).not.toContain('background: rgba(255, 244, 215, 0.94)');
    expect(miniWidgetBlock).not.toContain('box-shadow: 6px 6px 0 #c77738');
  });
});
