import {
  FORMAT_LABEL,
  FORMAT_MIME,
  INPUT_FORMATS,
  MAX_FILE_SIZE_BYTES,
  type CompressOutputFormat,
  type IcoSizePreset,
  type InputFormat,
  type OutputFormat,
  type SvgConvertMode,
} from './formats';
import { encodeImageToIco, isIcoMagicBytes } from './ico';
import { encodeImageToSvg } from './svg';

export interface ImageQueueItem {
  id: string;
  file: File;
  format: InputFormat;
  url: string;
  result: Blob | null;
  resultUrl: string | null;
  resultName: string | null;
  error: string | null;
  note?: string | null;
  split?: number;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

export function baseName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '');
}

export function readFileBuffer(file: File): Promise<ArrayBuffer> {
  if (file.arrayBuffer) return file.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('File could not be read.'));
    reader.readAsArrayBuffer(file);
  });
}

export function readFileText(file: File): Promise<string> {
  if (file.text) return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('File could not be read.'));
    reader.readAsText(file);
  });
}

export function detectImageFormat(buf: ArrayBuffer, name: string): InputFormat | null {
  const bytes = new Uint8Array(buf);

  // JPEG / JFIF
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpg';
  }
  // PNG
  if (
    bytes.length > 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'png';
  }
  // WebP (RIFF....WEBP)
  if (
    bytes.length > 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'webp';
  }
  // ICO (00 00 01 00 + count)
  if (isIcoMagicBytes(bytes)) {
    return 'ico';
  }
  // AVIF (ISO BMFF ftyp avif/avis)
  let head = '';
  const limit = Math.min(bytes.length, 64);
  for (let i = 0; i < limit; i++) {
    head += String.fromCharCode(bytes[i]);
  }
  if (head.includes('ftyp') && (head.includes('avif') || head.includes('avis'))) {
    return 'avif';
  }
  // SVG text check
  try {
    const text = new TextDecoder().decode(buf.slice(0, 2048)).trim();
    if (text.includes('<svg')) return 'svg';
  } catch {
    // ignore decode issues
  }

  // Fallback to extension only if header check didn't match
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (ext === 'jpeg' || ext === 'jfif') return 'jpg';
  if ((INPUT_FORMATS as readonly string[]).includes(ext)) {
    return ext as InputFormat;
  }
  return null;
}

export interface ValidationOutcome {
  items: ImageQueueItem[];
  errors: string[];
}

export async function validateImageFiles(
  fileList: FileList | File[],
  expectedFrom?: InputFormat | 'auto' | null
): Promise<ValidationOutcome> {
  const files = Array.from(fileList || []);
  const items: ImageQueueItem[] = [];
  const errors: string[] = [];

  if (!files.length) return { items, errors };

  const results = await Promise.all(
    files.map(async (file): Promise<ImageQueueItem | null> => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`${file.name}: exceeds the 30 MB per-file limit.`);
        return null;
      }

      try {
        const buf = await readFileBuffer(file);
        const format = detectImageFormat(buf, file.name);
        if (!format) {
          errors.push(
            `${file.name}: unsupported or corrupt — content does not match JPG, PNG, WebP, AVIF, ICO, or SVG.`
          );
          return null;
        }
        if (expectedFrom && expectedFrom !== 'auto' && format !== expectedFrom) {
          errors.push(
            `${file.name}: detected as ${FORMAT_LABEL[format]}, but this route expects ${FORMAT_LABEL[expectedFrom]}.`
          );
          return null;
        }

        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          file,
          format,
          url: URL.createObjectURL(file),
          result: null,
          resultUrl: null,
          resultName: null,
          error: null,
          note: null,
          split: 50,
        };
      } catch {
        errors.push(`${file.name}: could not be read.`);
        return null;
      }
    })
  );

  for (const item of results) {
    if (item) items.push(item);
  }
  return { items, errors };
}

export function createSampleImageFile(): Promise<File | null> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      const grad = ctx.createLinearGradient(0, 0, 0, 800);
      grad.addColorStop(0, '#7dd3fc');
      grad.addColorStop(0.6, '#e0f2fe');
      grad.addColorStop(0.61, '#8fce9b');
      grad.addColorStop(1, '#4d7c5f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 800);

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(980, 150, 70, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(0, 490);
      ctx.lineTo(300, 240);
      ctx.lineTo(560, 490);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(380, 490);
      ctx.lineTo(680, 200);
      ctx.lineTo(980, 490);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 54px sans-serif';
      ctx.fillText('ImageTools sample', 48, 92);
      ctx.font = '28px sans-serif';
      ctx.fillText('Generated locally in your browser for instant testing', 48, 142);

      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], 'sample-image.png', { type: 'image/png' }));
          } else {
            resolve(null);
          }
        }, 'image/png');
      } else {
        resolve(null);
      }
    } catch {
      resolve(null);
    }
  });
}

export function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error('This image could not be decoded by your browser.'));
    img.src = url;
  });
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (canvas.toBlob) {
      canvas.toBlob((blob) => resolve(blob), mimeType, quality);
    } else {
      try {
        const parts = canvas.toDataURL(mimeType, quality).split(',');
        const bin = atob(parts[1]);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        resolve(new Blob([arr], { type: mimeType }));
      } catch {
        resolve(null);
      }
    }
  });
}

export async function rasteriseImage(
  item: Pick<ImageQueueItem, 'url' | 'format'>,
  maxW?: number | null,
  maxH?: number | null
): Promise<{ canvas: HTMLCanvasElement; img: HTMLImageElement; w: number; h: number }> {
  const img = await loadImageElement(item.url);
  let w = img.naturalWidth || img.width || 800;
  let h = img.naturalHeight || img.height || 600;

  if (item.format === 'svg' && (!img.naturalWidth || !img.naturalHeight)) {
    w = 1024;
    h = 768;
  }

  if (maxW || maxH) {
    const scale = Math.min(
      maxW ? maxW / w : Infinity,
      maxH ? maxH / h : Infinity,
      1
    );
    if (Number.isFinite(scale) && scale > 0) {
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return { canvas, img, w, h };
}

export async function convertImageItem(
  item: ImageQueueItem,
  target: OutputFormat,
  options: { icoPreset?: IcoSizePreset; svgMode?: SvgConvertMode } = {}
): Promise<Blob> {
  if (target === 'ico') {
    const img = await loadImageElement(item.url);
    return encodeImageToIco(img, options.icoPreset ?? 'multi');
  }

  if (target === 'svg') {
    const img = await loadImageElement(item.url);
    return encodeImageToSvg(img, options.svgMode ?? 'trace');
  }

  const { canvas, img, w, h } = await rasteriseImage(item);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is unavailable.');

  if (target === 'jpg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(img, 0, 0, w, h);

  const mime = FORMAT_MIME[target];
  const blob = await canvasToBlob(canvas, mime, 0.92);
  if (!blob) {
    throw new Error(
      `Your browser could not encode ${FORMAT_LABEL[target]}. Try PNG, WebP, SVG, or ICO.`
    );
  }
  return blob;
}

export function optimiseSvgMarkup(text: string): string {
  return text
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<metadata[\s\S]*?<\/metadata>/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export interface CompressOptions {
  mode: 'lossy' | 'lossless';
  outFormat: CompressOutputFormat;
  quality: number; // 0.1 - 1.0
  maxWidth: number | null;
  maxHeight: number | null;
}

export interface CompressResult {
  blob: Blob;
  outName: string;
  note: string | null;
}

export async function compressImageItem(
  item: ImageQueueItem,
  options: CompressOptions
): Promise<CompressResult> {
  if (item.format === 'svg') {
    const raw = await readFileText(item.file);
    const optimised = optimiseSvgMarkup(raw);
    return {
      blob: new Blob([optimised], { type: 'image/svg+xml' }),
      outName: `${baseName(item.file.name)}-optimised.svg`,
      note: null,
    };
  }

  if (options.mode === 'lossless' && options.outFormat === 'jpg' && item.format === 'jpg') {
    return {
      blob: item.file,
      outName: item.file.name,
      note: 'Kept original JPEG untouched — a JPEG re-encode would be lossy, so no fake “lossless” copy was made.',
    };
  }

  const targetOut: CompressOutputFormat =
    options.mode === 'lossless'
      ? options.outFormat === 'webp'
        ? 'webp'
        : 'png'
      : options.outFormat;

  const { canvas, img, w, h } = await rasteriseImage(
    item,
    options.maxWidth,
    options.maxHeight
  );
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is unavailable.');

  if (targetOut === 'jpg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(img, 0, 0, w, h);

  const mime = FORMAT_MIME[targetOut];
  const qualityParam =
    options.mode === 'lossless'
      ? targetOut === 'webp'
        ? 1
        : undefined
      : options.quality;

  const blob = await canvasToBlob(canvas, mime, qualityParam);
  if (!blob || (blob.type && blob.type !== mime && targetOut === 'avif')) {
    throw new Error(
      `Your browser cannot encode ${FORMAT_LABEL[targetOut]}. Try WebP, PNG, or JPG.`
    );
  }

  return {
    blob,
    outName: `${baseName(item.file.name)}-compressed.${targetOut}`,
    note: null,
  };
}

export interface PdfOptions {
  pageSize: 'A4' | 'Letter' | 'Original';
  orientation: 'Auto' | 'Portrait' | 'Landscape';
  margin: 'Normal' | 'Small' | 'None';
  fit: 'fit' | 'fill';
  quality: number;
}

export async function createPdfFromImages(
  items: ImageQueueItem[],
  options: PdfOptions
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const marginMap = { None: 0, Small: 10, Normal: 20 };
  const margin = marginMap[options.margin];

  let doc: InstanceType<typeof jsPDF> | null = null;

  for (const item of items) {
    const { canvas, img, w, h } = await rasteriseImage(item);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable.');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const dataUrl = canvas.toDataURL('image/jpeg', options.quality);

    let pw: number;
    let ph: number;
    if (options.pageSize === 'A4') {
      pw = 210;
      ph = 297;
    } else if (options.pageSize === 'Letter') {
      pw = 215.9;
      ph = 279.4;
    } else {
      pw = Math.max(50, (w * 25.4) / 96);
      ph = Math.max(50, (h * 25.4) / 96);
    }

    const orient: 'l' | 'p' =
      options.orientation === 'Auto'
        ? w > h
          ? 'l'
          : 'p'
        : options.orientation === 'Landscape'
          ? 'l'
          : 'p';

    if (orient === 'l' && pw < ph) {
      [pw, ph] = [ph, pw];
    }
    if (orient === 'p' && ph < pw) {
      [pw, ph] = [ph, pw];
    }

    if (!doc) {
      doc = new jsPDF({ unit: 'mm', format: [pw, ph], orientation: orient });
    } else {
      doc.addPage([pw, ph], orient);
    }

    const aw = Math.max(10, pw - margin * 2);
    const ah = Math.max(10, ph - margin * 2);
    const ar = w / h;
    const boxAr = aw / ah;

    let iw: number;
    let ih: number;
    if (options.fit === 'fit') {
      if (ar > boxAr) {
        iw = aw;
        ih = aw / ar;
      } else {
        ih = ah;
        iw = ah * ar;
      }
    } else {
      if (ar > boxAr) {
        ih = ah;
        iw = ah * ar;
      } else {
        iw = aw;
        ih = aw / ar;
      }
    }

    doc.addImage(
      dataUrl,
      'JPEG',
      margin + (aw - iw) / 2,
      margin + (ah - ih) / 2,
      iw,
      ih
    );
  }

  if (!doc) {
    throw new Error('Add at least one image to create a PDF.');
  }
  return doc.output('blob');
}

export async function createZipArchive(
  entries: Array<{ name: string; blob: Blob }>
): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const seen: Record<string, boolean> = {};

  for (const entry of entries) {
    let name = entry.name;
    if (seen[name]) {
      name = name.replace(/(\.[^.]+)?$/, (m) => `-${Math.random().toString(36).slice(2, 6)}${m || ''}`);
    }
    seen[name] = true;
    zip.file(name, entry.blob);
  }

  return zip.generateAsync({ type: 'blob' });
}

export function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1500);
}

export function revokeItemUrls(item: Pick<ImageQueueItem, 'url' | 'resultUrl'>): void {
  if (item.url) URL.revokeObjectURL(item.url);
  if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
}
