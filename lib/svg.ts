import { type SvgConvertMode } from './formats';

function toHexByte(n: number): string {
  return n.toString(16).padStart(2, '0');
}

function quantizeChannel(value: number, step: number): number {
  return Math.min(255, Math.round(value / step) * step);
}

/**
 * Converts an HTMLImageElement into an SVG Blob locally in the browser.
 * - 'trace': Color-quantized vector trace with horizontal run-length merged <path>
 *   elements grouped by fill color (100% pure vector markup, editable in vector tools).
 * - 'embed': Lossless full-resolution PNG wrapped cleanly inside a scalable <svg> container.
 */
export async function encodeImageToSvg(
  img: HTMLImageElement,
  mode: SvgConvertMode = 'trace'
): Promise<Blob> {
  const srcW = img.naturalWidth || img.width || 800;
  const srcH = img.naturalHeight || img.height || 600;

  if (mode === 'embed') {
    const canvas = document.createElement('canvas');
    canvas.width = srcW;
    canvas.height = srcH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context is unavailable.');
    ctx.drawImage(img, 0, 0, srcW, srcH);
    const dataUrl = canvas.toDataURL('image/png');
    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${srcW} ${srcH}" width="${srcW}" height="${srcH}">`,
      `  <image width="${srcW}" height="${srcH}" href="${dataUrl}" />`,
      `</svg>`,
    ].join('\n');
    return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  }

  // Vector trace mode: cap tracing grid for fast, compact, editable vector paths
  const maxGrid = 96;
  const scale = Math.min(maxGrid / srcW, maxGrid / srcH, 1);
  const gridW = Math.max(1, Math.round(srcW * scale));
  const gridH = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = gridW;
  canvas.height = gridH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context is unavailable.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, gridW, gridH);

  const { data } = ctx.getImageData(0, 0, gridW, gridH);
  const colorStep = 32; // Clean posterization for crisp vector regions
  const pathsByColor = new Map<string, string[]>();

  for (let y = 0; y < gridH; y++) {
    let x = 0;
    while (x < gridW) {
      const idx = (y * gridW + x) * 4;
      const alpha = data[idx + 3];

      if (alpha < 128) {
        x++;
        continue;
      }

      const r = quantizeChannel(data[idx], colorStep);
      const g = quantizeChannel(data[idx + 1], colorStep);
      const b = quantizeChannel(data[idx + 2], colorStep);
      const hex = `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;

      let runLen = 1;
      while (x + runLen < gridW) {
        const nextIdx = (y * gridW + (x + runLen)) * 4;
        if (data[nextIdx + 3] < 128) break;
        const nr = quantizeChannel(data[nextIdx], colorStep);
        const ng = quantizeChannel(data[nextIdx + 1], colorStep);
        const nb = quantizeChannel(data[nextIdx + 2], colorStep);
        if (nr !== r || ng !== g || nb !== b) break;
        runLen++;
      }

      let cmds = pathsByColor.get(hex);
      if (!cmds) {
        cmds = [];
        pathsByColor.set(hex, cmds);
      }
      cmds.push(`M${x} ${y}h${runLen}v1h-${runLen}Z`);
      x += runLen;
    }
  }

  const pathElements: string[] = [];
  pathsByColor.forEach((cmds, hex) => {
    pathElements.push(`  <path fill="${hex}" d="${cmds.join('')}" />`);
  });

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gridW} ${gridH}" width="${srcW}" height="${srcH}" shape-rendering="crispEdges">`,
    ...pathElements,
    `</svg>`,
  ].join('\n');

  return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
}
