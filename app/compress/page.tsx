import type { Metadata } from 'next';
import { CompressorWorkspace } from '@/components/compressor-workspace';

export const metadata: Metadata = {
  title: 'Image Compressor',
  description:
    'Compress JPG, PNG, WebP, AVIF, ICO, and SVG images locally with honest lossless modes and a draggable before/after comparator.',
};

export default function CompressPage() {
  return <CompressorWorkspace />;
}
