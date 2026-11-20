import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about ImageTools principles and supported formats across JPG, PNG, WebP, AVIF, ICO, and SVG.',
};

const FORMAT_MATRIX = [
  { format: 'JPG / JPEG (incl. JFIF)', input: 'Yes', output: 'Yes' },
  { format: 'PNG', input: 'Yes', output: 'Yes' },
  { format: 'WebP', input: 'Yes', output: 'Yes' },
  { format: 'AVIF', input: 'Yes', output: 'Compressor only (where browser supports encoding)' },
  {
    format: 'ICO (Windows / Favicon)',
    input: 'Yes',
    output: 'Yes — single or multi-size (16–256 px) PNG-in-ICO',
  },
  {
    format: 'SVG',
    input: 'Yes',
    output: 'Yes — vector path trace or exact lossless embedded SVG',
  },
  { format: 'GIF', input: 'Excluded', output: 'Excluded from this release' },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#16211a] sm:text-3xl dark:text-[#eef4ef]">
          About ImageTools
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#5b6b60] sm:text-base dark:text-[#a7b8ac]">
          ImageTools is a focused set of image utilities that run entirely in your web browser:
          a format converter with 25 dedicated routes (including bidirectional{' '}
          <span className="font-mono">.ico</span> icon conversion), an image-to-PDF maker, and
          an honest image compressor.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#5b6b60] sm:text-base dark:text-[#a7b8ac]">
          It is built around three principles: your files stay on your device, results stay
          honest (real sizes, real savings, no fake “lossless” JPEG), and everyday tasks take
          seconds — drop, choose, download.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-[#16211a] dark:text-[#eef4ef]">
          Supported formats
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-[#dde3d8] bg-white dark:border-[#2a3a2f] dark:bg-[#16201b]">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#dde3d8] bg-[#f6f7f4] text-xs font-semibold text-[#5b6b60] dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#a7b8ac]">
                <th className="px-4 py-3">Format</th>
                <th className="px-4 py-3">Input</th>
                <th className="px-4 py-3">Output</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde3d8]/70 dark:divide-[#2a3a2f]/70">
              {FORMAT_MATRIX.map((row) => (
                <tr key={row.format}>
                  <td className="px-4 py-3 font-semibold text-[#16211a] dark:text-[#eef4ef]">
                    {row.format}
                  </td>
                  <td className="px-4 py-3 text-[#5b6b60] dark:text-[#a7b8ac]">{row.input}</td>
                  <td className="px-4 py-3 text-[#5b6b60] dark:text-[#a7b8ac]">{row.output}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
