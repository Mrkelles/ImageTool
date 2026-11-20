import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'ImageTools — Convert, Compress & PDF',
    short_name: 'ImageTools',
    description:
      'Private browser-based image converter (JPG, PNG, WebP, AVIF, ICO, SVG), Image to PDF maker, and honest Image Compressor.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#f6f7f4',
    theme_color: '#0f766e',
    categories: ['utilities', 'productivity', 'photo'],
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
