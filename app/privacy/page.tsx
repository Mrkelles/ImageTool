import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'ImageTools Privacy Policy — 100% local processing with zero image uploads.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#16211a] sm:text-3xl dark:text-[#eef4ef]">
        Privacy Policy
      </h1>

      <div className="space-y-5 rounded-2xl border border-[#dde3d8] bg-white p-6 text-sm leading-relaxed text-[#5b6b60] sm:text-base dark:border-[#2a3a2f] dark:bg-[#16201b] dark:text-[#a7b8ac]">
        <p>
          <strong className="text-[#16211a] dark:text-[#eef4ef]">Local processing.</strong>{' '}
          Images you open in ImageTools are processed entirely in your browser using Canvas,
          File, ICO, PDF, and ZIP code running on your device. They are not uploaded to, stored
          on, or transmitted to any ImageTools server — there is no image-processing backend.
        </p>
        <p>
          <strong className="text-[#16211a] dark:text-[#eef4ef]">What is stored.</strong> Only
          your light/dark theme preference is saved in your browser&apos;s local storage, and
          only where your browser allows storage; if storage is blocked, your theme simply
          applies for the current session. Image files and outputs live in tab memory only and
          disappear when you close the tab. Object URLs created for previews are revoked when
          files are removed or you leave a tool.
        </p>
        <p>
          <strong className="text-[#16211a] dark:text-[#eef4ef]">Downloads.</strong> Converted
          images, ICO files, PDFs, and ZIP archives are assembled on your device and saved
          through your browser&apos;s standard download mechanism.
        </p>
        <p>
          <strong className="text-[#16211a] dark:text-[#eef4ef]">Bundled libraries.</strong>{' '}
          ImageTools bundles its PDF and ZIP libraries directly with the app rather than loading
          external third-party scripts at runtime, keeping image workflows self-contained.
        </p>
        <p>
          <strong className="text-[#16211a] dark:text-[#eef4ef]">Contact form messages.</strong>{' '}
          If you choose to submit a message on the Contact page, your name, email address,
          topic, and message text are delivered via Resend strictly so we can read and reply to
          your inquiry. Your image files are never attached or sent.
        </p>
      </div>
    </div>
  );
}
