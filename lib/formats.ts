export const INPUT_FORMATS = ['jpg', 'png', 'webp', 'avif', 'svg', 'ico'] as const;
export const OUTPUT_FORMATS = ['jpg', 'png', 'webp', 'svg', 'ico'] as const;
export const COMPRESS_OUTPUT_FORMATS = ['webp', 'jpg', 'png', 'avif'] as const;

export type InputFormat = (typeof INPUT_FORMATS)[number];
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];
export type CompressOutputFormat = (typeof COMPRESS_OUTPUT_FORMATS)[number];

export const FORMAT_MIME: Record<InputFormat, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
};

export const FORMAT_LABEL: Record<InputFormat, string> = {
  jpg: 'JPG',
  png: 'PNG',
  webp: 'WebP',
  avif: 'AVIF',
  svg: 'SVG',
  ico: 'ICO',
};

export interface ConversionRoute {
  from: InputFormat;
  to: OutputFormat;
  slug: string;
}

export const CONVERSION_ROUTES: ConversionRoute[] = [];
for (const from of INPUT_FORMATS) {
  for (const to of OUTPUT_FORMATS) {
    if (from !== to) {
      CONVERSION_ROUTES.push({
        from,
        to,
        slug: `${from}-to-${to}`,
      });
    }
  }
}

export function findConversionRoute(slug: string): ConversionRoute | undefined {
  return CONVERSION_ROUTES.find((route) => route.slug === slug);
}

export function getRoutesByTarget(target: OutputFormat): ConversionRoute[] {
  return CONVERSION_ROUTES.filter((route) => route.to === target);
}

export type IcoSizePreset = 'multi' | '256' | '128' | '64' | '48' | '32' | '16';

export const ICO_PRESETS: Array<{
  value: IcoSizePreset;
  label: string;
  sizes: number[];
  hint: string;
}> = [
  {
    value: 'multi',
    label: 'Multi-size favicon (16–256 px)',
    sizes: [16, 32, 48, 64, 128, 256],
    hint: 'Packs 16, 32, 48, 64, 128 & 256 px PNG frames into one .ico file.',
  },
  {
    value: '256',
    label: '256 × 256 px (High-DPI)',
    sizes: [256],
    hint: 'Single crisp 256×256 icon frame.',
  },
  {
    value: '128',
    label: '128 × 128 px',
    sizes: [128],
    hint: 'Single 128×128 icon frame.',
  },
  {
    value: '64',
    label: '64 × 64 px',
    sizes: [64],
    hint: 'Single 64×64 icon frame.',
  },
  {
    value: '48',
    label: '48 × 48 px (Windows standard)',
    sizes: [48],
    hint: 'Single 48×48 icon frame.',
  },
  {
    value: '32',
    label: '32 × 32 px (Classic favicon)',
    sizes: [32],
    hint: 'Single 32×32 icon frame.',
  },
  {
    value: '16',
    label: '16 × 16 px (Browser tab)',
    sizes: [16],
    hint: 'Single 16×16 icon frame.',
  },
];

export type SvgConvertMode = 'trace' | 'embed';

export const SVG_MODES: Array<{
  value: SvgConvertMode;
  label: string;
  hint: string;
}> = [
  {
    value: 'trace',
    label: 'Vector trace (editable SVG paths)',
    hint: 'Traces color regions into pure scalable <path> vectors — great for logos & graphics.',
  },
  {
    value: 'embed',
    label: 'Exact SVG (lossless embedded image)',
    hint: 'Preserves 100% pixel fidelity inside a clean self-contained .svg file.',
  },
];

export const ACCEPT_ATTRIBUTE = '.jpg,.jpeg,.jfif,.png,.webp,.avif,.svg,.ico,image/*';
export const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024;
