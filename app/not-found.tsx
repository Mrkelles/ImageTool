import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <p className="font-mono text-xs font-semibold text-[#0f766e] dark:text-[#2dd4bf]">
        404 · Route not found
      </p>
      <h1 className="mt-2 font-display text-2xl font-extrabold text-[#16211a] sm:text-3xl dark:text-[#eef4ef]">
        That conversion or page doesn&apos;t exist
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#5b6b60] sm:text-base dark:text-[#a7b8ac]">
        Same-format conversions (such as PNG to PNG) and unsupported output formats aren&apos;t
        offered. Choose a supported format in the converter or browse all 25 valid routes.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/convert"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#134e4a] dark:bg-[#2dd4bf] dark:text-[#06231f]"
        >
          Go to the general converter
        </Link>
        <Link
          href="/convert/all"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#dde3d8] bg-white px-5 py-2.5 text-sm font-semibold text-[#16211a] transition-colors hover:bg-[#eef1ea] dark:border-[#2a3a2f] dark:bg-[#16201b] dark:text-[#eef4ef]"
        >
          View all 25 converters
        </Link>
      </div>
    </div>
  );
}
