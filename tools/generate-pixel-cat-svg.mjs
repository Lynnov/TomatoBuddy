import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
process.chdir(resolve(__dirname, '..'));

const sourcePath = resolve('参考图/寿喜Q.jpeg');
const outputPath = resolve('src/components/SukiyakiCatSvg.tsx');
const targetWidth = 128;
const quantizeStep = 8;
const alphaThreshold = 12;
const backgroundThreshold = 246;

const toBackground = ({ r, g, b, a }) =>
  a <= alphaThreshold || (r >= backgroundThreshold && g >= backgroundThreshold && b >= backgroundThreshold);

const quantize = (value) => Math.round(value / quantizeStep) * quantizeStep;

const toHex = (r, g, b) =>
  `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0'))
    .join('')}`;

const image = sharp(sourcePath)
  .trim({ background: '#ffffff', threshold: 18 })
  .resize({ width: targetWidth, fit: 'inside', kernel: 'nearest' })
  .ensureAlpha();

const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const rects = [];

for (let y = 0; y < height; y += 1) {
  let run = null;

  for (let x = 0; x < width; x += 1) {
    const offset = (y * width + x) * channels;
    const pixel = {
      r: data[offset],
      g: data[offset + 1],
      b: data[offset + 2],
      a: data[offset + 3],
    };

    const color = toBackground(pixel)
      ? null
      : toHex(quantize(pixel.r), quantize(pixel.g), quantize(pixel.b));

    if (run && run.color === color) {
      run.width += 1;
      continue;
    }

    if (run?.color) {
      rects.push(run);
    }

    run = color ? { x, y, width: 1, color } : null;
  }

  if (run?.color) {
    rects.push(run);
  }
}

const rectMarkup = rects
  .map(({ x, y, width: rectWidth, color }) =>
    `        <rect x={${x}} y={${y}} width={${rectWidth}} height={1} fill="${color}" />`,
  )
  .join('\n');

const component = `import type { SVGProps } from 'react';

export function SukiyakiCatSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      className="cat-svg"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 ${width} ${height}"
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="cat-body">
${rectMarkup}
      </g>
    </svg>
  );
}
`;

await writeFile(outputPath, component);

console.log(`Generated ${outputPath} (${width}x${height}, ${rects.length} rects)`);
