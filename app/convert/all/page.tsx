import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FORMAT_LABEL, OUTPUT_FORMATS, getRoutesByTarget } from '@/lib/formats';

export const metadata: Metadata = {
  title: 'All Converters',
  description:
    'Browse all 25 local image conversion routes across JPG, PNG, WebP, AVIF, ICO, and SVG.',
};

export default function AllConvertersPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-[#5b6b60] dark:text-[#a7b8ac]">
          Format Registry · 6 inputs · 5 outputs · 25 routes
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#16211a] sm:text-3xl dark:text-[#eef4ef]">
          All converters
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-[#5b6b60] sm:text-base dark:text-[#a7b8ac]">
          25 dedicated browser-based conversion routes generated from one format registry —
          including full bidirectional <span className="font-mono">.ico</span> icon support.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {OUTPUT_FORMATS.map((target) => {
          const routes = getRoutesByTarget(target);
          return (
            <section
              key={target}
              className="rounded-2xl border border-[#dde3d8] bg-white p-5 dark:border-[#2a3a2f] dark:bg-[#16201b]"
            >
              <h2 className="font-display text-lg font-bold text-[#16211a] dark:text-[#eef4ef]">
                Convert to {FORMAT_LABEL[target]}
              </h2>
              <p className="mt-1 text-xs text-[#5b6b60] dark:text-[#a7b8ac]">
                {target === 'ico'
                  ? 'Single-size or multi-size 16–256 px favicon bundles'
                  : target === 'svg'
                    ? 'Editable vector path trace or lossless embedded SVG'
                    : target === 'jpg'
                      ? 'Universal photography format with white backdrop for alpha'
                      : target === 'png'
                        ? 'Lossless raster output preserving full transparency'
                        : 'Modern lightweight web format with transparency'}
              </p>

              <div className="mt-4 divide-y divide-[#dde3d8]/70 dark:divide-[#2a3a2f]/70">
                {routes.map((route) => (
                  <Link
                    key={route.slug}
                    href={`/convert/${route.slug}`}
                    className="flex min-h-[44px] items-center justify-between py-2 text-sm font-semibold text-[#16211a] transition-colors hover:text-[#0f766e] dark:text-[#eef4ef] dark:hover:text-[#2dd4bf]"
                  >
                    <span>
                      {FORMAT_LABEL[route.from]} → {FORMAT_LABEL[route.to]}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#5b6b60] dark:text-[#a7b8ac]" />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
