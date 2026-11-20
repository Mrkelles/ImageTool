import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { AppShell } from '@/components/app-shell';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const sora = localFont({
  src: './fonts/sora-latin.woff2',
  weight: '600 800',
  style: 'normal',
  variable: '--font-sora',
  display: 'swap',
});

const ibmPlexSans = localFont({
  src: './fonts/ibm-plex-sans-latin.woff2',
  weight: '400 700',
  style: 'normal',
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

const ibmPlexMono = localFont({
  src: [
    { path: './fonts/ibm-plex-mono-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/ibm-plex-mono-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/ibm-plex-mono-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7f4' },
    { media: '(prefers-color-scheme: dark)', color: '#0e1512' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'ImageTools — Convert, Compress & PDF',
    template: '%s — ImageTools',
  },
  description:
    'Free browser-based image converter (JPG, PNG, WebP, AVIF, ICO, SVG), Image to PDF builder, and honest Image Compressor. 100% local processing with no uploads.',
  applicationName: 'ImageTools',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ImageTools',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'ImageTools — Convert, Compress & PDF',
    description:
      'Free browser-based image converter (JPG, PNG, WebP, AVIF, ICO, SVG), Image to PDF builder, and honest Image Compressor. 100% local processing with no uploads.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ImageTools — Convert, Compress & PDF',
    description:
      'Free browser-based image converter (JPG, PNG, WebP, AVIF, ICO, SVG), Image to PDF builder, and honest Image Compressor.',
  },
};

const themeInitScript = `
(function(){
  try {
    var t = window.localStorage.getItem('imagetools-theme');
    if (t !== 'dark' && t !== 'light') {
      t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
