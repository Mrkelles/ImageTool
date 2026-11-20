import type { Metadata } from 'next';
import { PdfWorkspace } from '@/components/pdf-workspace';

export const metadata: Metadata = {
  title: 'Image to PDF',
  description:
    'Combine JPG, PNG, WebP, AVIF, ICO, and SVG images into one ordered PDF directly in your browser.',
};

export default function ImageToPdfPage() {
  return <PdfWorkspace />;
}
