# SVG 小猫头像 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用高密度像素 SVG 坐姿三花折耳猫替换当前 CSS span 小猫，并保留现有摸猫、mini 拖拽和消息气泡交互。

**Architecture:** `PixelCat` 仍是唯一公开组件边界，内部从多个 span 改成内联 SVG 组件。阶段一通过开发期生成脚本从 `参考图/寿喜Q.jpeg` 生成 `SukiyakiCatSvg.tsx`，运行时不引入图片上传或图像处理能力。

**Tech Stack:** React、TypeScript、CSS、Vitest、Testing Library、Sharp（仅开发期生成 SVG 资产）。

---

## 文件结构

- 新建：`src/components/PixelCat.test.tsx`  
  负责直接验证 `PixelCat` 的按钮语义、SVG 渲染、消息气泡和点击行为。
- 新建：`tools/generate-pixel-cat-svg.mjs`  
  负责从 `参考图/寿喜Q.jpeg` 生成高密度像素 SVG React 组件。
- 新建：`src/components/SukiyakiCatSvg.tsx`  
  由生成脚本输出，负责渲染坐姿三花折耳猫 SVG。
- 修改：`src/components/PixelCat.tsx`  
  移除旧 span 小猫结构，改为渲染 `SukiyakiCatSvg`，保留按钮和 `message` 气泡。
- 修改：`src/styles.css`  
  删除旧 `.cat-face` / `.cat-ear` / `.cat-eye` / `.cat-mouth` / `.cat-tail` 样式，加入 `.cat-svg` 尺寸、待机动画、点击微弹和 mini 尺寸规则。
- 修改：`src/styles.test.ts`  
  更新样式测试，确保 SVG 小猫尺寸和 mini 光标规则存在。

---

### Task 1: 为 `PixelCat` 写 SVG 行为红测

**Files:**
- Create: `src/components/PixelCat.test.tsx`
- Read: `src/components/PixelCat.tsx`

- [ ] **Step 1: 写失败测试**

创建 `src/components/PixelCat.test.tsx`：

```tsx
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- src/components/PixelCat.test.tsx`

Expected: FAIL，失败原因应是 `svg.cat-svg` 不存在。

---

### Task 2: 添加开发期 SVG 生成脚本

**Files:**
- Create: `tools/generate-pixel-cat-svg.mjs`
- Modify: `package.json`
- Generate: `src/components/SukiyakiCatSvg.tsx`
- Input: `参考图/寿喜Q.jpeg`

- [ ] **Step 1: 安装开发期图片处理依赖**

Run: `npm install -D sharp`

Expected: `package.json` 和 lockfile 增加 `sharp` 开发依赖。该依赖只用于生成静态 SVG 资产，不进入运行时 UI 或上传功能。

- [ ] **Step 2: 创建生成脚本**

创建 `tools/generate-pixel-cat-svg.mjs`：

```js
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const sourcePath = resolve('参考图/寿喜Q.jpeg');
const outputPath = resolve('src/components/SukiyakiCatSvg.tsx');
const targetWidth = 128;
const alphaThreshold = 12;
const whiteThreshold = 246;
const quantizeStep = 8;

function isBackground(r, g, b, a) {
  return a <= alphaThreshold || (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold);
}

function quantize(value) {
  return Math.max(0, Math.min(255, Math.round(value / quantizeStep) * quantizeStep));
}

function toHex(r, g, b) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function pixelColor(buffer, offset) {
  const r = buffer[offset];
  const g = buffer[offset + 1];
  const b = buffer[offset + 2];
  const a = buffer[offset + 3];
  if (isBackground(r, g, b, a)) return null;
  return toHex(quantize(r), quantize(g), quantize(b));
}

function buildRects(buffer, width, height) {
  const rects = [];

  for (let y = 0; y < height; y += 1) {
    let runStart = 0;
    let runColor = null;

    for (let x = 0; x <= width; x += 1) {
      const color = x < width ? pixelColor(buffer, (y * width + x) * 4) : null;
      if (color === runColor) continue;

      if (runColor) {
        rects.push(`        <rect x="${runStart}" y="${y}" width="${x - runStart}" height="1" fill="${runColor}" />`);
      }

      runStart = x;
      runColor = color;
    }
  }

  return rects.join('\n');
}

const { data, info } = await sharp(sourcePath)
  .trim({ background: '#ffffff', threshold: 18 })
  .resize({ width: targetWidth, fit: 'inside', kernel: 'nearest' })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const rects = buildRects(data, info.width, info.height);
const content = `export function SukiyakiCatSvg() {
  return (
    <svg
      className="cat-svg"
      viewBox="0 0 ${info.width} ${info.height}"
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
    >
      <g className="cat-body">
${rects}
      </g>
    </svg>
  );
}
`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, content);
console.log(`Generated ${outputPath} (${info.width}x${info.height})`);
```

- [ ] **Step 3: 生成 SVG React 组件**

Run: `node tools/generate-pixel-cat-svg.mjs`

Expected: 输出类似 `Generated .../src/components/SukiyakiCatSvg.tsx (128x...)`，并生成 `src/components/SukiyakiCatSvg.tsx`。

- [ ] **Step 4: 检查生成文件的基本形态**

Run: `npm test -- src/components/PixelCat.test.tsx`

Expected: 仍然 FAIL，因为 `PixelCat` 尚未引用 `SukiyakiCatSvg`；不能因为生成文件存在就修改测试。

---

### Task 3: 接入 SVG 小猫组件

**Files:**
- Modify: `src/components/PixelCat.tsx`
- Read: `src/components/SukiyakiCatSvg.tsx`
- Test: `src/components/PixelCat.test.tsx`

- [ ] **Step 1: 修改 `PixelCat.tsx`**

把 `src/components/PixelCat.tsx` 改为：

```tsx
import type { TimerMode } from '../domain/types';
import { SukiyakiCatSvg } from './SukiyakiCatSvg';

interface PixelCatProps {
  mode: TimerMode;
  message: string | null;
  onPet: () => void;
}

export function PixelCat({ mode, message, onPet }: PixelCatProps) {
  return (
    <button
      type="button"
      className={`pixel-cat pixel-cat-${mode}`}
      onClick={onPet}
      aria-label="摸摸猫猫"
    >
      <SukiyakiCatSvg />
      {message && <span className="cat-bubble">{message}</span>}
    </button>
  );
}
```

- [ ] **Step 2: 运行 `PixelCat` 测试确认通过**

Run: `npm test -- src/components/PixelCat.test.tsx`

Expected: PASS，3 tests passed。

---

### Task 4: 更新 SVG 小猫样式

**Files:**
- Modify: `src/styles.css:93-177`
- Modify: `src/styles.css:272-287`
- Test: `src/styles.test.ts`

- [ ] **Step 1: 先写失败样式测试**

修改 `src/styles.test.ts` 中 mini widget styles 测试，保留现有透明和可读性测试，并将拖拽 affordance 测试扩展为：

```ts
  it('sizes the SVG cat and keeps mini frame outside the cat as the drag affordance', () => {
    const catBlock = getRuleBlock('.pixel-cat');
    const catSvgBlock = getRuleBlock('.cat-svg');
    const miniWidgetBlock = getRuleBlock('.is-mini-mode .mini-widget');
    const miniCatBlock = getRuleBlock('.is-mini-mode .mini-widget .pixel-cat');

    expect(css).not.toContain('.mini-drag-handle');
    expect(catBlock).toContain('animation: cat-idle');
    expect(catSvgBlock).toContain('width: 100%');
    expect(catSvgBlock).toContain('height: 100%');
    expect(miniWidgetBlock).toContain('cursor: grab');
    expect(miniCatBlock).toContain('cursor: pointer');
  });
```

- [ ] **Step 2: 运行样式测试确认失败**

Run: `npm test -- src/styles.test.ts`

Expected: FAIL，失败原因应是 `.cat-svg` 规则不存在或 `.pixel-cat` 仍使用旧 `cat-bob` 动画。

- [ ] **Step 3: 更新 `styles.css` 中小猫基础样式**

将旧小猫部件样式 `.cat-face`、`.cat-ear`、`.cat-eye`、`.cat-mouth`、`.cat-tail` 删除，保留并更新 `.pixel-cat`、`.pixel-cat:active`、`.cat-bubble`：

```css
.pixel-cat {
  position: relative;
  display: block;
  width: 180px;
  height: 180px;
  margin: 12px auto 14px;
  border: 0;
  background: transparent;
  box-shadow: none;
  padding: 0;
  animation: cat-idle 2.4s ease-in-out infinite;
}

.pixel-cat:active {
  transform: scale(0.98);
  box-shadow: none;
}

.cat-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  filter: drop-shadow(0 8px 0 rgba(58, 42, 28, 0.16));
}

.cat-bubble {
  position: absolute;
  left: 128px;
  top: 4px;
  width: 130px;
  background: #ffffff;
  border: 3px solid #3a2a1c;
  padding: 8px;
  font-size: 13px;
  box-shadow: 4px 4px 0 #3a2a1c;
}
```

- [ ] **Step 4: 更新 mini 下 SVG 小猫尺寸**

将现有 mini 小猫规则改为：

```css
.mini-widget .pixel-cat {
  width: 126px;
  height: 126px;
  margin: -8px auto -8px;
}

.is-mini-mode .mini-widget .pixel-cat {
  width: 126px;
  height: 126px;
  margin: -12px auto -10px;
  cursor: pointer;
}

.is-mini-mode .mini-widget:active {
  cursor: grabbing;
}

.is-mini-mode .mini-widget .cat-bubble {
  left: 92px;
  top: 0;
  box-shadow: none;
}
```

- [ ] **Step 5: 替换 keyframes**

将旧 `cat-bob`、`cat-blink`、`tail-wag` keyframes 替换为阶段一只需要的待机动画：

```css
@keyframes cat-idle {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -4px; }
}
```

- [ ] **Step 6: 运行样式测试确认通过**

Run: `npm test -- src/styles.test.ts`

Expected: PASS，3 tests passed。

---

### Task 5: 验证 mini 交互未回退

**Files:**
- Test: `src/components/MiniWidget.test.tsx`
- Test: `src/components/PixelCat.test.tsx`

- [ ] **Step 1: 运行组件相关测试**

Run: `npm test -- src/components/PixelCat.test.tsx src/components/MiniWidget.test.tsx`

Expected: PASS，`PixelCat` 和 `MiniWidget` 测试全部通过。

- [ ] **Step 2: 如果 `MiniWidget` 测试失败，只允许修复组件结构导致的查询问题**

允许的修复范围：

```tsx
screen.getByRole('button', { name: '摸摸猫猫' })
```

仍应作为小猫按钮查询方式；不要改成按 `.cat-svg` 或 DOM 层级查询，因为小猫对用户仍然是按钮。

---

### Task 6: 全量验证和浏览器手测

**Files:**
- Verify: `src/components/PixelCat.tsx`
- Verify: `src/components/SukiyakiCatSvg.tsx`
- Verify: `src/styles.css`

- [ ] **Step 1: 运行完整测试套件**

Run: `npm test`

Expected: PASS，所有 test files 和 tests 全部通过。

- [ ] **Step 2: 运行生产构建**

Run: `npm run build`

Expected: PASS，`tsc && vite build` 成功完成。

- [ ] **Step 3: 启动开发服务器**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite 输出本地地址，例如 `http://127.0.0.1:5173/`。

- [ ] **Step 4: 浏览器验证完整模式**

打开 Vite 地址，验证：

- 页面中小猫显示为参考图坐姿三花折耳猫。
- 点击小猫会出现消息气泡。
- 小猫没有被拉伸变形。
- 计时器和按钮布局没有被 SVG 尺寸挤坏。

- [ ] **Step 5: 浏览器验证 mini 模式**

点击“切换迷你挂件”，验证：

- mini 中小猫仍清晰可辨，不显得粗糙或裁切。
- 点击小猫仍出现消息气泡。
- 双击小猫或 mini 框仍能展开。
- 在小猫外的 mini 框/时间区域仍能拖动窗口。
- 点击小猫不会启动窗口拖拽。

- [ ] **Step 6: 检查 diff，不提交**

Run: `git diff -- src/components src/styles.css src/styles.test.ts package.json package-lock.json tools docs/superpowers/plans/2026-05-21-svg-cat-avatar.md`

Expected: diff 只包含本计划相关改动。不要运行 `git commit`，除非用户明确要求提交。

---

## 自审记录

- Spec 覆盖：阶段一 SVG 替换、按钮语义、消息气泡、full/mini 尺寸、轻微动画、浏览器验证均有任务覆盖。
- 延期范围：眨眼、摇尾巴、趴姿、走姿、上传图片 UI 均未进入本计划。
- 类型一致性：`PixelCat` props 保持 `mode`、`message`、`onPet`；新增组件名统一为 `SukiyakiCatSvg`。
- 占位扫描：计划中无 TBD/TODO；生成型内容由明确脚本生成。
