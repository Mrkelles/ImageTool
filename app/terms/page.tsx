import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'ImageTools Terms of Service.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#16211a] sm:text-3xl dark:text-[#eef4ef]">
        Terms of Service
      </h1>

      <div className="space-y-5 rounded-2xl border border-[#dde3d8] bg-white p-6 text-sm leading-relaxed text-[#5b6b60] sm:text-base dark:border-[#2a3a2f] dark:bg-[#16201b] dark:text-[#a7b8ac]">
        <p>
          ImageTools is provided free, as-is, for converting, compressing, and combining your
          own images (or images you have the right to use). Because processing runs on your
          device, output quality and format support depend on your browser — AVIF encoding in
          particular varies across browser engines.
        </p>
        <p>
          You are responsible for the files you process and for keeping copies of your
          originals. ImageTools is not liable for data loss, unsuitable output, or decisions
          made based on converted or compressed files. Do not use these tools to infringe
          anyone&apos;s rights.
        </p>
      </div>
    </div>
  );
}
