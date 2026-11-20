/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Archive,
  ArrowLeftRight,
  CheckCircle2,
  Download,
  Loader2,
  Trash2,
} from 'lucide-react';
import {
  FORMAT_LABEL,
  ICO_PRESETS,
  INPUT_FORMATS,
  OUTPUT_FORMATS,
  SVG_MODES,
  type IcoSizePreset,
  type InputFormat,
  type OutputFormat,
  type SvgConvertMode,
} from '@/lib/formats';
import {
  baseName,
  convertImageItem,
  createSampleImageFile,
  createZipArchive,
  formatBytes,
  revokeItemUrls,
  triggerBlobDownload,
  validateImageFiles,
  type ImageQueueItem,
} from '@/lib/image-engine';
import { ImageDropZone } from './image-drop-zone';

interface ConverterWorkspaceProps {
  initialFrom?: InputFormat | 'auto';
  initialTo?: OutputFormat;
}

export function ConverterWorkspace({
  initialFrom = 'auto',
  initialTo = 'png',
}: ConverterWorkspaceProps) {
  const router = useRouter();
  const [fromFormat, setFromFormat] = useState<InputFormat | 'auto'>(initialFrom);
  const [toFormat, setToFormat] = useState<OutputFormat>(initialTo);
  const [icoPreset, setIcoPreset] = useState<IcoSizePreset>('multi');
  const [svgMode, setSvgMode] = useState<SvgConvertMode>('trace');
  const [items, setItems] = useState<ImageQueueItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);

  const itemsRef = useRef<ImageQueueItem[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach(revokeItemUrls);
    };
  }, []);

  const scrollIntoViewSafely = (el: HTMLElement | null) => {
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  };

  const syncFormatSelection = (nextFrom: InputFormat | 'auto', nextTo: OutputFormat) => {
    let resolvedTo = nextTo;
    if (nextFrom !== 'auto' && nextFrom === resolvedTo) {
      resolvedTo = OUTPUT_FORMATS.find((o) => o !== nextFrom) ?? 'png';
    }
    setFromFormat(nextFrom);
    setToFormat(resolvedTo);

    if (nextFrom === 'auto') {
      router.push('/convert');
    } else {
      router.push(`/convert/${nextFrom}-to-${resolvedTo}`);
    }
  };

  const handleFilesSelected = async (fileList: FileList | File[]) => {
    setErrors([]);
    setStatusNotice(null);
    const outcome = await validateImageFiles(fileList, fromFormat);

    if (outcome.errors.length > 0) {
      setErrors(outcome.errors);
    }
    if (outcome.items.length > 0) {
      setItems((prev) => [...prev, ...outcome.items]);
      setStatusNotice(
        `Added ${outcome.items.length} image${outcome.items.length === 1 ? '' : 's'} — ready to convert.`
      );
      setTimeout(() => scrollIntoViewSafely(gridRef.current), 60);
    } else if (outcome.errors.length > 0) {
      setTimeout(() => scrollIntoViewSafely(feedbackRef.current), 60);
    }
  };

  const handleUseSample = async () => {
    setSampleLoading(true);
    try {
      const file = await createSampleImageFile();
      if (!file) {
        setErrors(['Sample image could not be created in this browser.']);
        return;
      }
      if (fromFormat !== 'auto' && fromFormat !== 'png') {
        setStatusNotice(
          'Switched source format to Auto-detect so the PNG sample image can be tested right away.'
        );
        setFromFormat('auto');
        const outcome = await validateImageFiles([file], 'auto');
        if (outcome.items.length > 0) {
          setItems((prev) => [...prev, ...outcome.items]);
          setTimeout(() => scrollIntoViewSafely(gridRef.current), 60);
        }
        return;
      }
      await handleFilesSelected([file]);
    } finally {
      setSampleLoading(false);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) revokeItemUrls(target);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearAll = () => {
    items.forEach(revokeItemUrls);
    setItems([]);
    setErrors([]);
    setStatusNotice(null);
    setProgress(0);
  };

  const handleConvertAll = async () => {
    if (items.length === 0) {
      setErrors([
        'Add at least one image first — drop, browse, paste, or use the sample image.',
      ]);
      return;
    }

    setErrors([]);
    setStatusNotice(null);
    setIsProcessing(true);
    setProgress(0);

    const working = [...items];
    for (let i = 0; i < working.length; i++) {
      const current = { ...working[i], error: null as string | null };
      try {
        if (current.format === toFormat) {
          current.error = `Already ${FORMAT_LABEL[toFormat]} — skipped.`;
          if (current.resultUrl) URL.revokeObjectURL(current.resultUrl);
          current.result = null;
          current.resultUrl = null;
          current.resultName = null;
        } else {
          const blob = await convertImageItem(current, toFormat, {
            icoPreset,
            svgMode,
          });
          if (current.resultUrl) URL.revokeObjectURL(current.resultUrl);
          current.result = blob;
          current.resultUrl = URL.createObjectURL(blob);
          current.resultName = `${baseName(current.file.name)}.${toFormat}`;
        }
      } catch (err) {
        current.error =
          err instanceof Error ? err.message : 'Conversion failed for this image.';
        if (current.resultUrl) URL.revokeObjectURL(current.resultUrl);
        current.result = null;
        current.resultUrl = null;
      }
      working[i] = current;
      setItems([...working]);
      setProgress(Math.round(((i + 1) / working.length) * 100));
    }

    setIsProcessing(false);
  };

  const handleDownloadZip = async () => {
    const entries = items
      .filter((item) => item.result && item.resultName)
      .map((item) => ({ name: item.resultName!, blob: item.result! }));

    if (entries.length === 0) return;

    setZipLoading(true);
    try {
      const zipBlob = await createZipArchive(entries);
      triggerBlobDownload(zipBlob, 'imagetools-converted.zip');
    } catch {
      setErrors([
        'Could not assemble the ZIP archive. You can still download each converted file individually.',
      ]);
    } finally {
      setZipLoading(false);
    }
  };

  const hasConverted = items.some((item) => Boolean(item.result));
  const heading =
    fromFormat === 'auto'
      ? 'Image Converter'
      : `${FORMAT_LABEL[fromFormat]} to ${FORMAT_LABEL[toFormat]} Converter`;

  const description =
    fromFormat === 'auto'
      ? 'Convert JPG, PNG, WebP, AVIF, ICO, and SVG images locally in your browser. Auto-detect handles mixed batches effortlessly.'
      : toFormat === 'ico'
        ? `Convert ${FORMAT_LABEL[fromFormat]} images into single-size or multi-size favicon .ico files locally — no uploads, alpha transparency preserved.`
        : toFormat === 'svg'
          ? `Convert ${FORMAT_LABEL[fromFormat]} images to scalable .svg files locally — choose editable vector path tracing or an exact lossless SVG wrapper.`
          : `Convert ${FORMAT_LABEL[fromFormat]} images to ${FORMAT_LABEL[toFormat]} right on your device — dimensions preserved, zero uploads.`;

  const activeIcoPreset =
    ICO_PRESETS.find((p) => p.value === icoPreset) ?? ICO_PRESETS[0];
  const activeSvgMode =
    SVG_MODES.find((m) => m.value === svgMode) ?? SVG_MODES[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[#5b6b60] dark:text-[#a7b8ac]">
            Tool 01 · 25 local conversion routes · Zero uploads
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-balance text-[#16211a] sm:text-3xl dark:text-[#eef4ef]">
            {heading}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-[#5b6b60] sm:text-base dark:text-[#a7b8ac]">
            {description}
          </p>
        </div>

        <Link
          href="/convert/all"
          className="inline-flex min-h-[40px] items-center gap-1.5 self-start text-sm font-semibold text-[#0f766e] hover:underline whitespace-nowrap shrink-0 sm:self-end dark:text-[#2dd4bf]"
        >
          <span>All 25 converters</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Format Controls */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#dde3d8] bg-white p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-5 dark:border-[#2a3a2f] dark:bg-[#16201b]">
        <label className="block">
          <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
            Convert from
          </span>
          <select
            value={fromFormat}
            onChange={(e) =>
              syncFormatSelection(e.target.value as InputFormat | 'auto', toFormat)
            }
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3 py-2 text-sm font-medium text-[#16211a] focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:focus:border-[#2dd4bf]"
          >
            <option value="auto">Auto-detect (mixed batch)</option>
            {INPUT_FORMATS.map((fmt) => (
              <option key={fmt} value={fmt}>
                {FORMAT_LABEL[fmt]}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-[#5b6b60] dark:text-[#a7b8ac]">
            Magic-byte inspection reads each file&apos;s true format.
          </span>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
            Convert to
          </span>
          <select
            value={toFormat}
            onChange={(e) =>
              syncFormatSelection(fromFormat, e.target.value as OutputFormat)
            }
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3 py-2 text-sm font-medium text-[#16211a] focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:focus:border-[#2dd4bf]"
          >
            {OUTPUT_FORMATS.map((fmt) => (
              <option key={fmt} value={fmt}>
                {FORMAT_LABEL[fmt]}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-[#5b6b60] dark:text-[#a7b8ac]">
            {toFormat === 'jpg'
              ? 'Transparent pixels receive a clean white backdrop.'
              : toFormat === 'ico'
                ? 'Non-square images are centered with transparent padding.'
                : toFormat === 'svg'
                  ? 'Outputs clean, scalable .svg vector markup locally.'
                  : 'Transparency is preserved where supported.'}
          </span>
        </label>

        {toFormat === 'ico' ? (
          <label className="block sm:col-span-2 lg:col-span-1">
            <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
              ICO icon dimensions
            </span>
            <select
              value={icoPreset}
              onChange={(e) => setIcoPreset(e.target.value as IcoSizePreset)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3 py-2 text-sm font-medium text-[#16211a] focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:focus:border-[#2dd4bf]"
            >
              {ICO_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-[#5b6b60] dark:text-[#a7b8ac]">
              {activeIcoPreset.hint}
            </span>
          </label>
        ) : toFormat === 'svg' ? (
          <label className="block sm:col-span-2 lg:col-span-1">
            <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
              SVG output mode
            </span>
            <select
              value={svgMode}
              onChange={(e) => setSvgMode(e.target.value as SvgConvertMode)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3 py-2 text-sm font-medium text-[#16211a] focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:focus:border-[#2dd4bf]"
            >
              {SVG_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-[#5b6b60] dark:text-[#a7b8ac]">
              {activeSvgMode.hint}
            </span>
          </label>
        ) : (
          <div className="hidden flex-col justify-center rounded-xl bg-[#f6f7f4] px-4 py-3 lg:flex dark:bg-[#1e2b23]">
            <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
              Need an SVG or favicon?
            </span>
            <p className="mt-0.5 text-xs text-[#5b6b60] dark:text-[#a7b8ac]">
              Choose <strong>SVG</strong> for scalable vectors or <strong>ICO</strong> for
              multi-size <span className="font-mono">.ico</span> favicon bundles.
            </p>
          </div>
        )}
      </div>

      {/* Drop Zone */}
      <ImageDropZone
        ariaLabel="Add images to convert"
        helperText="JPG (incl. JFIF) · PNG · WebP · AVIF · ICO · SVG — max 30 MB per file. Clipboard paste supported."
        onFilesSelected={handleFilesSelected}
        onUseSample={handleUseSample}
        sampleLoading={sampleLoading}
      />

      {/* Feedback banners */}
      <div ref={feedbackRef} className="scroll-mt-20 space-y-2">
        {statusNotice && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{statusNotice}</span>
          </div>
        )}
        {errors.map((err, idx) => (
          <div
            key={`${err}-${idx}`}
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/70 dark:bg-red-950/60 dark:text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{err}</span>
          </div>
        ))}
      </div>

      {/* Primary Action Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={handleConvertAll}
          disabled={isProcessing}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-[#134e4a] disabled:opacity-50 sm:flex-none dark:bg-[#2dd4bf] dark:text-[#06231f] dark:hover:bg-[#5eead4]"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowLeftRight className="h-4 w-4" />
          )}
          <span>
            {isProcessing
              ? `Converting (${progress}%)…`
              : `Convert to ${FORMAT_LABEL[toFormat]}`}
          </span>
        </button>

        <button
          type="button"
          onClick={handleDownloadZip}
          disabled={!hasConverted || zipLoading}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#dde3d8] bg-white px-4 py-2.5 text-sm font-semibold text-[#16211a] transition-all active:scale-[0.98] hover:bg-[#eef1ea] disabled:cursor-not-allowed disabled:opacity-45 dark:border-[#2a3a2f] dark:bg-[#16201b] dark:text-[#eef4ef] dark:hover:bg-[#1e2b23]"
        >
          {zipLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
          <span>Download ZIP</span>
        </button>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#dde3d8] bg-white px-4 py-2.5 text-sm font-semibold text-[#5b6b60] transition-colors hover:bg-[#eef1ea] hover:text-[#16211a] dark:border-[#2a3a2f] dark:bg-[#16201b] dark:text-[#a7b8ac] dark:hover:bg-[#1e2b23] dark:hover:text-[#eef4ef]"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 w-full overflow-hidden rounded-full bg-[#eef1ea] dark:bg-[#1e2b23]"
        >
          <div
            className="h-full bg-[#0f766e] transition-all duration-150 dark:bg-[#2dd4bf]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Queue Grid or Empty State */}
      <div ref={gridRef} className="scroll-mt-20">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#dde3d8] px-6 py-10 text-center text-sm text-[#5b6b60] dark:border-[#2a3a2f] dark:text-[#a7b8ac]">
            No images queued yet. Drop, browse, paste, or use the sample image above — your files
            will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col rounded-2xl border border-[#dde3d8] bg-white p-3.5 dark:border-[#2a3a2f] dark:bg-[#16201b]"
              >
                <div className="bg-checkerboard relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-[#dde3d8]/70 dark:border-[#2a3a2f]/70">
                  <img
                    src={item.url}
                    alt={`Preview of ${item.file.name}`}
                    className="h-full w-full object-contain p-1"
                  />
                </div>

                <div className="mt-3 flex-1">
                  <h3 className="truncate font-sans text-sm font-semibold text-[#16211a] dark:text-[#eef4ef]">
                    {item.file.name}
                  </h3>
                  <p className="mt-1 font-mono text-xs tabular-nums text-[#5b6b60] dark:text-[#a7b8ac]">
                    {FORMAT_LABEL[item.format]} · {formatBytes(item.file.size)}
                    {item.result && (
                      <>
                        {' '}
                        →{' '}
                        <span className="font-semibold text-[#0f766e] dark:text-[#2dd4bf]">
                          {FORMAT_LABEL[toFormat]} ({formatBytes(item.result.size)})
                        </span>
                      </>
                    )}
                  </p>
                  {item.error && (
                    <p className="mt-1.5 text-xs font-medium text-red-700 dark:text-red-400">
                      {item.error}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2 pt-2">
                  {item.resultUrl && item.resultName && (
                    <a
                      href={item.resultUrl}
                      download={item.resultName}
                      className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0f766e] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#134e4a] dark:bg-[#2dd4bf] dark:text-[#06231f] dark:hover:bg-[#5eead4]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="inline-flex min-h-[40px] items-center justify-center gap-1 rounded-lg border border-[#dde3d8] bg-[#f6f7f4] px-3 py-1.5 text-xs font-semibold text-[#5b6b60] transition-colors hover:bg-[#eef1ea] hover:text-[#16211a] dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#a7b8ac] dark:hover:bg-[#26362c] dark:hover:text-[#eef4ef]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
