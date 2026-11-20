import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/contact-form';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Send a message to ImageTools or run quick local troubleshooting checks.',
};

export default function ContactPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-[#5b6b60] dark:text-[#a7b8ac]">
          Support · Bug reports · Format requests
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#16211a] sm:text-3xl dark:text-[#eef4ef]">
          Contact &amp; Help
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-[#5b6b60] sm:text-base dark:text-[#a7b8ac]">
          Have a question, spotted a browser quirk, or want to suggest a tool improvement? Send
          a note below or test with our built-in sample image first.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ContactForm />
        </div>

        <aside className="space-y-4 rounded-2xl border border-[#dde3d8] bg-white p-5 text-sm leading-relaxed text-[#5b6b60] sm:p-6 lg:col-span-5 dark:border-[#2a3a2f] dark:bg-[#16201b] dark:text-[#a7b8ac]">
          <h2 className="font-display text-base font-bold text-[#16211a] dark:text-[#eef4ef]">
            Quick troubleshooting
          </h2>
          <p>
            If a tool isn&apos;t behaving as expected, the fastest check is to reload the page
            and try it again with the built-in sample image:{' '}
            <Link
              href="/convert"
              className="font-semibold text-[#0f766e] underline underline-offset-4 dark:text-[#2dd4bf]"
            >
              open the converter
            </Link>
            ,{' '}
            <Link
              href="/image-to-pdf"
              className="font-semibold text-[#0f766e] underline underline-offset-4 dark:text-[#2dd4bf]"
            >
              open Image to PDF
            </Link>
            , or{' '}
            <Link
              href="/compress"
              className="font-semibold text-[#0f766e] underline underline-offset-4 dark:text-[#2dd4bf]"
            >
              open the compressor
            </Link>
            .
          </p>
          <p>
            Every image tool works locally on your device, so you never need to send your
            pictures to anyone for troubleshooting. Only the text you explicitly submit in this
            form is emailed so we can respond.
          </p>
        </aside>
      </div>
    </div>
  );
}
