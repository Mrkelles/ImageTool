import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, Sora } from 'next/font/google';
import { AppShell } from '@/components/app-shell';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
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
