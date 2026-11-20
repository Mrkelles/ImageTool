import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ConverterWorkspace } from '@/components/converter-workspace';
import { CONVERSION_ROUTES, FORMAT_LABEL, findConversionRoute } from '@/lib/formats';

export function generateStaticParams() {
  return CONVERSION_ROUTES.map((route) => ({ slug: route.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const route = findConversionRoute(slug);
  if (!route) {
    return { title: 'Converter Not Found' };
  }
  const fromLabel = FORMAT_LABEL[route.from];
  const toLabel = FORMAT_LABEL[route.to];
  return {
    title: `${fromLabel} to ${toLabel} Converter`,
    description: `Convert ${fromLabel} images to ${toLabel} directly in your browser — private, fast, and free with zero uploads.`,
  };
}

export default async function DedicatedConverterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const route = findConversionRoute(slug);

  if (!route) {
    notFound();
  }

  return (
    <ConverterWorkspace
      key={route.slug}
      initialFrom={route.from}
      initialTo={route.to}
    />
  );
}
