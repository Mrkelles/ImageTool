import { ICO_PRESETS, type IcoSizePreset } from './formats';

function canvasToPngBuffer(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('Could not encode PNG frame for ICO output.'));
          return;
        }
        try {
          const buf = await blob.arrayBuffer();
          resolve(new Uint8Array(buf));
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Failed reading PNG frame bytes.'));
        }
      },
      'image/png'
    );
  });
}

function renderSquareFrame(img: HTMLImageElement, size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable.');
  }

  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const srcW = img.naturalWidth || img.width || size;
  const srcH = img.naturalHeight || img.height || size;
  const scale = Math.min(size / srcW, size / srcH);
  const drawW = Math.max(1, Math.round(srcW * scale));
  const drawH = Math.max(1, Math.round(srcH * scale));
  const offsetX = Math.floor((size - drawW) / 2);
  const offsetY = Math.floor((size - drawH) / 2);

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  return canvas;
}

/**
 * Encodes one or more square PNG frames into a standard Windows / Favicon .ico
 * binary container (ICONDIR + ICONDIRENTRY[] + PNG payloads).
 * PNG-encoded ICO entries preserve full 32-bit RGBA alpha transparency and are
 * natively supported by all modern browsers, Windows, and macOS.
 */
export async function encodeImageToIco(
  img: HTMLImageElement,
  preset: IcoSizePreset = 'multi'
): Promise<Blob> {
  const presetObj = ICO_PRESETS.find((p) => p.value === preset) ?? ICO_PRESETS[0];
  const sizes = presetObj.sizes;

  const frames: Array<{ size: number; bytes: Uint8Array }> = [];
  for (const size of sizes) {
    const canvas = renderSquareFrame(img, size);
    const bytes = await canvasToPngBuffer(canvas);
    frames.push({ size, bytes });
  }

  const headerSize = 6;
  const dirEntrySize = 16;
  const directoryTotal = headerSize + frames.length * dirEntrySize;
  const payloadTotal = frames.reduce((sum, f) => sum + f.bytes.byteLength, 0);

  const output = new Uint8Array(directoryTotal + payloadTotal);
  const view = new DataView(output.buffer);

  // ICONDIR header
  view.setUint16(0, 0, true); // Reserved (must be 0)
  view.setUint16(2, 1, true); // Image type: 1 = ICO
  view.setUint16(4, frames.length, true); // Number of images

  let dataOffset = directoryTotal;
  frames.forEach((frame, index) => {
    const entryOffset = headerSize + index * dirEntrySize;
    // Width & Height: 0 represents 256px in the ICO specification
    const dimByte = frame.size >= 256 ? 0 : frame.size;

    view.setUint8(entryOffset + 0, dimByte); // Width
    view.setUint8(entryOffset + 1, dimByte); // Height
    view.setUint8(entryOffset + 2, 0); // Color palette (0 = no palette)
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel (32-bit RGBA)
    view.setUint32(entryOffset + 8, frame.bytes.byteLength, true); // Image data size
    view.setUint32(entryOffset + 12, dataOffset, true); // Offset from start of file

    output.set(frame.bytes, dataOffset);
    dataOffset += frame.bytes.byteLength;
  });

  return new Blob([output], { type: 'image/x-icon' });
}

/**
 * Checks whether an ArrayBuffer begins with a valid ICO ICONDIR signature:
 * 00 00 01 00 followed by a non-zero image count.
 */
export function isIcoMagicBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 6) return false;
  const reserved = bytes[0] === 0x00 && bytes[1] === 0x00;
  const typeIco = bytes[2] === 0x01 && bytes[3] === 0x00;
  const count = bytes[4] | (bytes[5] << 8);
  return reserved && typeIco && count >= 1 && count <= 256;
}
