import Link from 'next/link';
import {
  ArrowLeftRight,
  ArrowRight,
  ChevronDown,
  FileText,
  Minimize2,
  ShieldCheck,
} from 'lucide-react';

const FAQS = [
  {
    q: 'Are my images uploaded anywhere?',
    a: 'No. All format conversion, ICO packing, PDF generation, and compression run locally inside your browser using native Canvas and file APIs.',
  },
  {
    q: 'How does .ico conversion work?',
    a: 'ImageTools packs square, aspect-ratio-preserved PNG frames (either a multi-size 16–256 px favicon bundle or a single chosen size) directly into a standard .ico container on your device — preserving full alpha transparency.',
  },
  {
    q: 'Why isn’t GIF supported?',
    a: 'GIF was intentionally excluded from this release to keep animated-frame handling honest rather than silently flattening multi-frame animations into a single still image.',
  },
  {
    q: 'Can I convert a PNG or JPG to SVG?',
    a: 'Yes. Choosing SVG as your output format lets you trace images locally into editable vector paths, or wrap the lossless full-detail image inside a clean scalable .svg file.',
  },
  {
    q: 'Is AVIF still supported?',
    a: 'Yes — AVIF is supported as a source format in the converter (AVIF → JPG, PNG, WebP, SVG, or ICO), and in Image to PDF and the Image Compressor.',
  },
  {
    q: 'Is lossless JPEG compression real?',
    a: 'Re-encoding a JPEG always introduces loss. In lossless mode, ImageTools will keep an existing JPEG untouched rather than pretending a lossy re-encode is lossless.',
  },
];

const QUICK_ROUTES = [
  { slug: 'png-to-svg', label: 'PNG → SVG' },
  { slug: 'png-to-ico', label: 'PNG → ICO' },
  { slug: 'svg-to-ico', label: 'SVG → ICO' },
  { slug: 'ico-to-png', label: 'ICO → PNG' },
  { slug: 'jpg-to-png', label: 'JPG → PNG' },
  { slug: 'png-to-webp', label: 'PNG → WebP' },
];

export default function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* HERO */}
      <section className="pt-2 sm:pt-6">
        <p className="text-xs font-semibold text-[#0f766e] sm:text-sm dark:text-[#2dd4bf]">
          100% in your browser · No uploads · No sign-up
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-balance text-[#16211a] sm:text-5xl sm:leading-[1.1] dark:text-[#eef4ef]">
          Convert, compress, and PDF your images — privately.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#5b6b60] sm:text-lg dark:text-[#a7b8ac]">
          Three fast utilities that run entirely on your device. Your files never leave your
          browser, so there is nothing to upload, wait for, or worry about.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/convert"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-6 py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-[#134e4a] dark:bg-[#2dd4bf] dark:text-[#06231f] dark:hover:bg-[#5eead4]"
          >
            <span>Start converting</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/compress"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#dde3d8] bg-white px-6 py-3 text-sm font-semibold text-[#16211a] transition-all active:scale-[0.98] hover:bg-[#eef1ea] dark:border-[#2a3a2f] dark:bg-[#16201b] dark:text-[#eef4ef] dark:hover:bg-[#1e2b23]"
          >
            <span>Compress an image</span>
          </Link>
        </div>
      </section>

      {/* THREE CORE TOOLS */}
      <section aria-label="Image tools" className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        <article className="flex flex-col rounded-2xl border border-[#dde3d8] bg-white p-5 transition-colors hover:border-[#0f766e]/50 sm:p-6 dark:border-[#2a3a2f] dark:bg-[#16201b] dark:hover:border-[#2dd4bf]/50">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#0f766e] dark:text-[#2dd4bf]">
              Tool 01
            </span>
            <ArrowLeftRight className="h-5 w-5 text-[#5b6b60] dark:text-[#a7b8ac]" />
          </div>
          <h2 className="mt-3 font-display text-xl font-bold text-[#16211a] dark:text-[#eef4ef]">
            Image Converter
          </h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5b6b60] dark:text-[#a7b8ac]">
            Convert between JPG, PNG, WebP, SVG, and multi-size ICO — plus AVIF as a source.
            25 dedicated routes like <span className="font-mono text-xs">PNG → SVG</span> and{' '}
            <span className="font-mono text-xs">PNG → ICO</span>, batch uploads, and instant ZIP download.
          </p>
          <Link
            href="/convert"
            className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-[#134e4a] dark:bg-[#2dd4bf] dark:text-[#06231f] dark:hover:bg-[#5eead4]"
          >
            <span>Open converter</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>

        <article className="flex flex-col rounded-2xl border border-[#dde3d8] bg-white p-5 transition-colors hover:border-[#0f766e]/50 sm:p-6 dark:border-[#2a3a2f] dark:bg-[#16201b] dark:hover:border-[#2dd4bf]/50">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#0f766e] dark:text-[#2dd4bf]">
              Tool 02
            </span>
            <FileText className="h-5 w-5 text-[#5b6b60] dark:text-[#a7b8ac]" />
          </div>
          <h2 className="mt-3 font-display text-xl font-bold text-[#16211a] dark:text-[#eef4ef]">
            Image to PDF
          </h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5b6b60] dark:text-[#a7b8ac]">
            Combine multiple images into one tidy PDF — reorder with touch buttons or
            drag-and-drop, choose A4, Letter, or original size, margins, and fit or fill.
          </p>
          <Link
            href="/image-to-pdf"
            className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-4 py-2.5 text-sm font-semibold text-[#16211a] transition-all active:scale-[0.98] hover:bg-[#eef1ea] dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:hover:bg-[#26362c]"
          >
            <span>Create a PDF</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>

        <article className="flex flex-col rounded-2xl border border-[#dde3d8] bg-white p-5 transition-colors hover:border-[#0f766e]/50 sm:p-6 dark:border-[#2a3a2f] dark:bg-[#16201b] dark:hover:border-[#2dd4bf]/50">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#0f766e] dark:text-[#2dd4bf]">
              Tool 03
            </span>
            <Minimize2 className="h-5 w-5 text-[#5b6b60] dark:text-[#a7b8ac]" />
          </div>
          <h2 className="mt-3 font-display text-xl font-bold text-[#16211a] dark:text-[#eef4ef]">
            Image Compressor
          </h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5b6b60] dark:text-[#a7b8ac]">
            Shrink files with a quality slider or honest lossless modes, optional max
            dimensions, and a draggable before and after comparison with real byte savings.
          </p>
          <Link
            href="/compress"
            className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-4 py-2.5 text-sm font-semibold text-[#16211a] transition-all active:scale-[0.98] hover:bg-[#eef1ea] dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:hover:bg-[#26362c]"
          >
            <span>Compress images</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </section>

      {/* POPULAR CONVERTER SHORTCUTS */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-[#16211a] sm:text-2xl dark:text-[#eef4ef]">
            Popular conversion routes
          </h2>
          <Link
            href="/convert/all"
            className="text-sm font-semibold text-[#0f766e] hover:underline whitespace-nowrap shrink-0 dark:text-[#2dd4bf]"
          >
            All 25 routes →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ROUTES.map((route) => (
            <Link
              key={route.slug}
              href={`/convert/${route.slug}`}
              className="flex min-h-[48px] items-center justify-center rounded-xl border border-[#dde3d8] bg-white px-3 text-sm font-semibold text-[#16211a] transition-colors active:scale-[0.98] hover:border-[#0f766e] hover:text-[#0f766e] dark:border-[#2a3a2f] dark:bg-[#16201b] dark:text-[#eef4ef] dark:hover:border-[#2dd4bf] dark:hover:text-[#2dd4bf]"
            >
              {route.label}
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="space-y-4 border-t border-[#dde3d8] pt-10 dark:border-[#2a3a2f]">
        <h2 className="font-display text-xl font-bold text-[#16211a] sm:text-2xl dark:text-[#eef4ef]">
          How it works
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#dde3d8] bg-white p-5 dark:border-[#2a3a2f] dark:bg-[#16201b]">
            <h3 className="font-display text-base font-bold text-[#16211a] dark:text-[#eef4ef]">
              01. Drop your files
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5b6b60] dark:text-[#a7b8ac]">
              Drag images in, tap the drop zone to browse, paste directly from your clipboard,
              or use the built-in sample image to test a tool immediately.
            </p>
          </div>
          <div className="rounded-2xl border border-[#dde3d8] bg-white p-5 dark:border-[#2a3a2f] dark:bg-[#16201b]">
            <h3 className="font-display text-base font-bold text-[#16211a] dark:text-[#eef4ef]">
              02. Pick your settings
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5b6b60] dark:text-[#a7b8ac]">
              Target format, ICO icon dimensions, compression quality, PDF page size, margins,
              and resize bounds are all adjustable before processing.
            </p>
          </div>
          <div className="rounded-2xl border border-[#dde3d8] bg-white p-5 dark:border-[#2a3a2f] dark:bg-[#16201b]">
            <h3 className="font-display text-base font-bold text-[#16211a] dark:text-[#eef4ef]">
              03. Download instantly
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5b6b60] dark:text-[#a7b8ac]">
              Files are generated locally using native Canvas, binary ICO, PDF, and ZIP tools.
              Save results one by one or download everything together as a ZIP.
            </p>
          </div>
        </div>
      </section>

      {/* PRIVATE BY DESIGN */}
      <section className="rounded-2xl border border-[#dde3d8] bg-white p-6 sm:p-8 dark:border-[#2a3a2f] dark:bg-[#16201b]">
        <div className="flex items-start gap-3.5">
          <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#0f766e] dark:text-[#2dd4bf]" />
          <div>
            <h2 className="font-display text-xl font-bold text-[#16211a] dark:text-[#eef4ef]">
              Private by design
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#5b6b60] sm:text-base dark:text-[#a7b8ac]">
              There is no ImageTools server receiving your pictures. Processing uses your
              browser&apos;s own image, canvas, and file APIs. Close the tab and every in-memory
              copy disappears immediately. The only setting stored on your device is your light
              or dark theme preference. Read the full{' '}
              <Link
                href="/privacy"
                className="font-semibold text-[#0f766e] underline underline-offset-4 dark:text-[#2dd4bf]"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-[#16211a] sm:text-2xl dark:text-[#eef4ef]">
          Frequently asked questions
        </h2>
        <div className="space-y-2.5">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-[#dde3d8] bg-white open:border-[#0f766e]/50 dark:border-[#2a3a2f] dark:bg-[#16201b] dark:open:border-[#2dd4bf]/50"
            >
              <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-3.5 text-sm font-semibold text-[#16211a] sm:text-base dark:text-[#eef4ef]">
                <span>{faq.q}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[#5b6b60] transition-transform duration-150 group-open:rotate-180 dark:text-[#a7b8ac]" />
              </summary>
              <div className="border-t border-[#dde3d8]/70 px-5 pb-4 pt-3 text-sm leading-relaxed text-[#5b6b60] dark:border-[#2a3a2f]/70 dark:text-[#a7b8ac]">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
