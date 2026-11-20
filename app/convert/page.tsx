import type { Metadata } from 'next';
import { ConverterWorkspace } from '@/components/converter-workspace';

export const metadata: Metadata = {
  title: 'Image Converter',
  description:
    'Convert JPG, PNG, WebP, AVIF, ICO, and SVG images locally in your browser with auto-detect and batch ZIP downloads.',
};

export default function ConvertPage() {
  return <ConverterWorkspace initialFrom="auto" initialTo="png" />;
}
