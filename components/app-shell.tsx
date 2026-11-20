'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  FileText,
  Home,
  Info,
  Mail,
  Minimize2,
  Moon,
  MoreHorizontal,
  Scale,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  FORMAT_LABEL,
  OUTPUT_FORMATS,
  findConversionRoute,
  getRoutesByTarget,
} from '@/lib/formats';
import { useTheme } from './theme-provider';
import { OfflineIndicator, PWAInstallButton } from './pwa-install-button';

function getMobilePageTitle(pathname: string): { title: string; backHref: string | null } {
  if (pathname === '/') return { title: 'ImageTools', backHref: null };
  if (pathname === '/convert') return { title: 'Converter', backHref: null };
  if (pathname === '/convert/all') return { title: 'All Converters', backHref: '/convert' };
  if (pathname.startsWith('/convert/')) {
    const slug = pathname.replace('/convert/', '');
    const route = findConversionRoute(slug);
    if (route) {
      return {
        title: `${FORMAT_LABEL[route.from]} to ${FORMAT_LABEL[route.to]}`,
        backHref: '/convert',
      };
    }
    return { title: 'Converter', backHref: '/convert' };
  }
  if (pathname === '/image-to-pdf') return { title: 'Image to PDF', backHref: null };
  if (pathname === '/compress') return { title: 'Compressor', backHref: null };
  if (pathname === '/about') return { title: 'About', backHref: '/' };
  if (pathname === '/contact') return { title: 'Contact', backHref: '/' };
  if (pathname === '/privacy') return { title: 'Privacy Policy', backHref: '/' };
  if (pathname === '/terms') return { title: 'Terms of Service', backHref: '/' };
  return { title: 'ImageTools', backHref: '/' };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, mounted, toggleTheme } = useTheme();
  const [convMenuPath, setConvMenuPath] = useState<string | null>(null);
  const [moreSheetPath, setMoreSheetPath] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const convMenuOpen = convMenuPath === pathname;
  const moreSheetOpen = moreSheetPath === pathname;
  const setConvMenuOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    setConvMenuPath((prev) => {
      const currentlyOpen = prev === pathname;
      const shouldOpen = typeof next === 'function' ? next(currentlyOpen) : next;
      return shouldOpen ? pathname : null;
    });
  };
  const setMoreSheetOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    setMoreSheetPath((prev) => {
      const currentlyOpen = prev === pathname;
      const shouldOpen = typeof next === 'function' ? next(currentlyOpen) : next;
      return shouldOpen ? pathname : null;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setConvMenuPath(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setConvMenuPath(null);
        setMoreSheetPath(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isConvertActive = pathname === '/convert' || pathname.startsWith('/convert/');
  const isPdfActive = pathname === '/image-to-pdf';
  const isCompressActive = pathname === '/compress';
  const isHomeActive = pathname === '/';
  const isMoreActive = ['/about', '/contact', '/privacy', '/terms', '/convert/all'].includes(
    pathname
  );

  const mobileHeader = getMobilePageTitle(pathname);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col bg-[#f6f7f4] text-[#16211a] transition-colors duration-150 dark:bg-[#0e1512] dark:text-[#eef4ef]">
        {/* DESKTOP TOP BAR (3-Zone Contract) */}
        <header className="sticky top-0 z-40 hidden border-b border-[#dde3d8] bg-white/95 backdrop-blur-md md:block dark:border-[#2a3a2f] dark:bg-[#16201b]/95">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
            {/* Zone 1: Brand Wordmark */}
            <Link
              href="/"
              className="font-display text-xl font-extrabold tracking-tight text-[#16211a] whitespace-nowrap shrink-0 dark:text-[#eef4ef]"
            >
              Image<span className="text-[#0f766e] dark:text-[#2dd4bf]">Tools</span>
            </Link>

            {/* Zone 2: Primary Nav Links */}
            <nav aria-label="Main navigation" className="flex items-center gap-6 text-sm font-semibold">
              <Link
                href="/"
                className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                  isHomeActive
                    ? 'text-[#0f766e] underline decoration-2 underline-offset-8 dark:text-[#2dd4bf]'
                    : 'text-[#5b6b60] hover:text-[#16211a] dark:text-[#a7b8ac] dark:hover:text-[#eef4ef]'
                }`}
              >
                Home
              </Link>

              <div className="relative flex items-center" ref={dropdownRef}>
                <Link
                  href="/convert"
                  className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                    isConvertActive
                      ? 'text-[#0f766e] underline decoration-2 underline-offset-8 dark:text-[#2dd4bf]'
                      : 'text-[#5b6b60] hover:text-[#16211a] dark:text-[#a7b8ac] dark:hover:text-[#eef4ef]'
                  }`}
                >
                  Converter
                </Link>
                <button
                  type="button"
                  onClick={() => setConvMenuOpen((v) => !v)}
                  aria-expanded={convMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Toggle all converter formats"
                  className="ml-0.5 flex h-8 w-7 items-center justify-center rounded-md text-[#5b6b60] transition-colors hover:bg-[#eef1ea] hover:text-[#16211a] dark:text-[#a7b8ac] dark:hover:bg-[#1e2b23] dark:hover:text-[#eef4ef]"
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-150 ${
                      convMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {convMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      role="menu"
                      className="absolute left-0 top-full mt-3 w-[min(780px,90vw)] rounded-2xl border border-[#dde3d8] bg-white p-5 shadow-xl dark:border-[#2a3a2f] dark:bg-[#16201b]"
                    >
                      <div className="grid grid-cols-5 gap-4">
                        {OUTPUT_FORMATS.map((target) => (
                          <div key={target}>
                            <p className="mb-2 text-xs font-semibold text-[#5b6b60] dark:text-[#a7b8ac]">
                              To {FORMAT_LABEL[target]}
                            </p>
                            <div className="space-y-0.5">
                              {getRoutesByTarget(target).map((route) => (
                                <Link
                                  key={route.slug}
                                  role="menuitem"
                                  href={`/convert/${route.slug}`}
                                  onClick={() => setConvMenuOpen(false)}
                                  className="block rounded-lg px-2 py-1.5 text-sm font-medium text-[#16211a] transition-colors hover:bg-[#eef1ea] hover:text-[#0f766e] dark:text-[#eef4ef] dark:hover:bg-[#1e2b23] dark:hover:text-[#2dd4bf]"
                                >
                                  {FORMAT_LABEL[route.from]} → {FORMAT_LABEL[route.to]}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-[#dde3d8] pt-3 dark:border-[#2a3a2f]">
                        <span className="text-xs text-[#5b6b60] dark:text-[#a7b8ac]">
                          25 local conversion routes · Including SVG &amp; multi-size ICO
                        </span>
                        <Link
                          href="/convert/all"
                          onClick={() => setConvMenuOpen(false)}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f766e] hover:underline dark:text-[#2dd4bf]"
                        >
                          <span>View all converters</span>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/image-to-pdf"
                className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                  isPdfActive
                    ? 'text-[#0f766e] underline decoration-2 underline-offset-8 dark:text-[#2dd4bf]'
                    : 'text-[#5b6b60] hover:text-[#16211a] dark:text-[#a7b8ac] dark:hover:text-[#eef4ef]'
                }`}
              >
                Image to PDF
              </Link>

              <Link
                href="/compress"
                className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                  isCompressActive
                    ? 'text-[#0f766e] underline decoration-2 underline-offset-8 dark:text-[#2dd4bf]'
                    : 'text-[#5b6b60] hover:text-[#16211a] dark:text-[#a7b8ac] dark:hover:text-[#eef4ef]'
                }`}
              >
                Compress
              </Link>

              <Link
                href="/about"
                className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                  pathname === '/about'
                    ? 'text-[#0f766e] underline decoration-2 underline-offset-8 dark:text-[#2dd4bf]'
                    : 'text-[#5b6b60] hover:text-[#16211a] dark:text-[#a7b8ac] dark:hover:text-[#eef4ef]'
                }`}
              >
                About
              </Link>
            </nav>

            {/* Zone 3: Primary Action & Theme Toggle */}
            <div className="flex items-center gap-2.5 shrink-0">
              <PWAInstallButton variant="header" />
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  mounted && theme === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[#dde3d8] bg-white px-3.5 py-2 text-sm font-semibold text-[#16211a] whitespace-nowrap shrink-0 transition-colors hover:bg-[#eef1ea] dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:hover:bg-[#26362c]"
              >
                {mounted && theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4 text-[#e8b33d]" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 text-[#0f766e]" />
                    <span>Dark</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* MOBILE TOP APP BAR (Compact 52px sticky native header) */}
        <header className="pt-safe sticky top-0 z-40 border-b border-[#dde3d8]/90 bg-white/90 backdrop-blur-md md:hidden dark:border-[#2a3a2f]/90 dark:bg-[#16201b]/90">
          <div className="grid h-[52px] grid-cols-[48px_1fr_auto] items-center px-2">
            <div className="flex items-center justify-start">
              {mobileHeader.backHref ? (
                <button
                  type="button"
                  onClick={() => router.push(mobileHeader.backHref!)}
                  aria-label="Go back"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#16211a] active:scale-95 dark:text-[#eef4ef]"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              ) : (
                <Link
                  href="/"
                  aria-label="ImageTools Home"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f766e] font-display text-xs font-extrabold text-white dark:bg-[#2dd4bf] dark:text-[#06231f]">
                    IT
                  </span>
                </Link>
              )}
            </div>

            <div className="min-w-0 px-2 text-center">
              {mobileHeader.title === 'ImageTools' ? (
                <span className="font-display text-base font-extrabold tracking-tight text-[#16211a] dark:text-[#eef4ef]">
                  Image<span className="text-[#0f766e] dark:text-[#2dd4bf]">Tools</span>
                </span>
              ) : (
                <span className="block truncate font-display text-base font-bold text-[#16211a] dark:text-[#eef4ef]">
                  {mobileHeader.title}
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-0.5">
              <PWAInstallButton variant="compact" />
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  mounted && theme === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#16211a] transition-colors active:scale-95 hover:bg-[#eef1ea] dark:text-[#eef4ef] dark:hover:bg-[#1e2b23]"
              >
                {mounted && theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-[#e8b33d]" />
                ) : (
                  <Moon className="h-5 w-5 text-[#0f766e]" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-5 md:px-6 md:pb-16 md:pt-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>

        {/* DESKTOP FOOTER */}
        <footer className="hidden border-t border-[#dde3d8] bg-white/60 py-10 text-sm text-[#5b6b60] md:block dark:border-[#2a3a2f] dark:bg-[#16201b]/60 dark:text-[#a7b8ac]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-display font-bold text-[#16211a] dark:text-[#eef4ef]">
                  ImageTools
                </span>
                <span className="mx-2 text-[#dde3d8] dark:text-[#2a3a2f]">·</span>
                <span>Processed locally in your browser, always.</span>
              </div>
              <nav aria-label="Footer links" className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <Link href="/" className="hover:text-[#0f766e] dark:hover:text-[#2dd4bf]">
                  Home
                </Link>
                <Link href="/convert" className="hover:text-[#0f766e] dark:hover:text-[#2dd4bf]">
                  Converter
                </Link>
                <Link href="/convert/all" className="hover:text-[#0f766e] dark:hover:text-[#2dd4bf]">
                  All converters
                </Link>
                <Link href="/image-to-pdf" className="hover:text-[#0f766e] dark:hover:text-[#2dd4bf]">
                  Image to PDF
                </Link>
                <Link href="/compress" className="hover:text-[#0f766e] dark:hover:text-[#2dd4bf]">
                  Compress
                </Link>
                <Link href="/about" className="hover:text-[#0f766e] dark:hover:text-[#2dd4bf]">
                  About
                </Link>
                <Link href="/contact" className="hover:text-[#0f766e] dark:hover:text-[#2dd4bf]">
                  Contact
                </Link>
                <Link href="/privacy" className="hover:text-[#0f766e] dark:hover:text-[#2dd4bf]">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-[#0f766e] dark:hover:text-[#2dd4bf]">
                  Terms
                </Link>
              </nav>
            </div>
            <p className="mt-4 text-xs text-[#5b6b60] dark:text-[#a7b8ac]">
              © 2026 ImageTools. No accounts, no uploads, no tracking of your images.
            </p>
          </div>
        </footer>

        {/* MOBILE FIXED BOTTOM TAB BAR (60px + safe-area) */}
        <nav
          aria-label="Mobile bottom navigation"
          className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-[#dde3d8]/95 bg-white/95 backdrop-blur-md md:hidden dark:border-[#2a3a2f]/95 dark:bg-[#16201b]/95"
        >
          <div className="grid h-[60px] grid-cols-5 items-center px-1">
            <Link
              href="/"
              className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors active:scale-95 ${
                isHomeActive
                  ? 'text-[#0f766e] dark:text-[#2dd4bf]'
                  : 'text-[#5b6b60] dark:text-[#a7b8ac]'
              }`}
            >
              <Home className="h-[21px] w-[21px]" strokeWidth={isHomeActive ? 2.4 : 1.9} />
              <span className="text-[10px] font-semibold tracking-tight">Home</span>
            </Link>

            <Link
              href="/convert"
              className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors active:scale-95 ${
                isConvertActive && pathname !== '/convert/all'
                  ? 'text-[#0f766e] dark:text-[#2dd4bf]'
                  : 'text-[#5b6b60] dark:text-[#a7b8ac]'
              }`}
            >
              <ArrowLeftRight
                className="h-[21px] w-[21px]"
                strokeWidth={isConvertActive && pathname !== '/convert/all' ? 2.4 : 1.9}
              />
              <span className="text-[10px] font-semibold tracking-tight">Convert</span>
            </Link>

            <Link
              href="/image-to-pdf"
              className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors active:scale-95 ${
                isPdfActive
                  ? 'text-[#0f766e] dark:text-[#2dd4bf]'
                  : 'text-[#5b6b60] dark:text-[#a7b8ac]'
              }`}
            >
              <FileText className="h-[21px] w-[21px]" strokeWidth={isPdfActive ? 2.4 : 1.9} />
              <span className="text-[10px] font-semibold tracking-tight">PDF</span>
            </Link>

            <Link
              href="/compress"
              className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors active:scale-95 ${
                isCompressActive
                  ? 'text-[#0f766e] dark:text-[#2dd4bf]'
                  : 'text-[#5b6b60] dark:text-[#a7b8ac]'
              }`}
            >
              <Minimize2
                className="h-[21px] w-[21px]"
                strokeWidth={isCompressActive ? 2.4 : 1.9}
              />
              <span className="text-[10px] font-semibold tracking-tight">Compress</span>
            </Link>

            <button
              type="button"
              onClick={() => setMoreSheetOpen(true)}
              aria-expanded={moreSheetOpen}
              className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors active:scale-95 ${
                isMoreActive || moreSheetOpen
                  ? 'text-[#0f766e] dark:text-[#2dd4bf]'
                  : 'text-[#5b6b60] dark:text-[#a7b8ac]'
              }`}
            >
              <MoreHorizontal
                className="h-[21px] w-[21px]"
                strokeWidth={isMoreActive || moreSheetOpen ? 2.4 : 1.9}
              />
              <span className="text-[10px] font-semibold tracking-tight">More</span>
            </button>
          </div>
        </nav>

        {/* MOBILE "MORE" BOTTOM SHEET */}
        <AnimatePresence>
          {moreSheetOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setMoreSheetOpen(false)}
              className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-xs md:hidden"
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="pb-safe max-h-[82dvh] w-full overflow-y-auto rounded-t-3xl border-t border-[#dde3d8] bg-white px-5 pb-6 pt-3 shadow-2xl dark:border-[#2a3a2f] dark:bg-[#16201b]"
              >
                <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#dde3d8] dark:bg-[#2a3a2f]" />

                <div className="flex items-center justify-between pb-3">
                  <h2 className="font-display text-lg font-bold text-[#16211a] dark:text-[#eef4ef]">
                    More &amp; Quick Converters
                  </h2>
                  <button
                    type="button"
                    onClick={() => setMoreSheetOpen(false)}
                    aria-label="Close menu"
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#5b6b60] hover:bg-[#eef1ea] dark:text-[#a7b8ac] dark:hover:bg-[#1e2b23]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <PWAInstallButton
                    variant="sheet"
                    onAfterAction={() => setMoreSheetOpen(false)}
                  />

                  {/* Popular Converter Shortcuts */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#5b6b60] dark:text-[#a7b8ac]">
                        Popular converters
                      </p>
                      <Link
                        href="/convert/all"
                        onClick={() => setMoreSheetOpen(false)}
                        className="text-xs font-semibold text-[#0f766e] dark:text-[#2dd4bf]"
                      >
                        All 25 routes →
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { slug: 'png-to-svg', label: 'PNG → SVG' },
                        { slug: 'jpg-to-svg', label: 'JPG → SVG' },
                        { slug: 'png-to-ico', label: 'PNG → ICO' },
                        { slug: 'svg-to-ico', label: 'SVG → ICO' },
                        { slug: 'jpg-to-png', label: 'JPG → PNG' },
                        { slug: 'png-to-webp', label: 'PNG → WebP' },
                      ].map((item) => (
                        <Link
                          key={item.slug}
                          href={`/convert/${item.slug}`}
                          onClick={() => setMoreSheetOpen(false)}
                          className="flex min-h-[44px] items-center justify-between rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3.5 text-sm font-semibold text-[#16211a] active:scale-[0.98] dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef]"
                        >
                          <span>{item.label}</span>
                          <ChevronRight className="h-4 w-4 text-[#5b6b60] dark:text-[#a7b8ac]" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Pages */}
                  <div className="divide-y divide-[#dde3d8] overflow-hidden rounded-2xl border border-[#dde3d8] bg-[#f6f7f4] dark:divide-[#2a3a2f] dark:border-[#2a3a2f] dark:bg-[#1e2b23]">
                    {[
                      { href: '/convert/all', label: 'All 25 Converters', icon: ArrowLeftRight },
                      { href: '/about', label: 'About ImageTools', icon: Info },
                      { href: '/contact', label: 'Contact & Help', icon: Mail },
                      { href: '/privacy', label: 'Privacy Policy', icon: ShieldCheck },
                      { href: '/terms', label: 'Terms of Service', icon: Scale },
                    ].map((row) => {
                      const Icon = row.icon;
                      return (
                        <Link
                          key={row.href}
                          href={row.href}
                          onClick={() => setMoreSheetOpen(false)}
                          className="flex min-h-[52px] items-center justify-between px-4 text-sm font-medium text-[#16211a] active:bg-[#eef1ea] dark:text-[#eef4ef] dark:active:bg-[#26362c]"
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-[#0f766e] dark:text-[#2dd4bf]" />
                            <span>{row.label}</span>
                          </span>
                          <ChevronRight className="h-4 w-4 text-[#5b6b60] dark:text-[#a7b8ac]" />
                        </Link>
                      );
                    })}
                  </div>

                  <p className="text-center text-xs text-[#5b6b60] dark:text-[#a7b8ac]">
                    ImageTools · 100% local processing · No uploads
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <OfflineIndicator />
      </div>
    </MotionConfig>
  );
}
