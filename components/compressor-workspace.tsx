/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Download,
  Info,
  Loader2,
  Minimize2,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import {
  COMPRESS_OUTPUT_FORMATS,
  FORMAT_LABEL,
  type CompressOutputFormat,
} from '@/lib/formats';
import {
  compressImageItem,
  createSampleImageFile,
  createZipArchive,
  formatBytes,
  revokeItemUrls,
  triggerBlobDownload,
  validateImageFiles,
  type ImageQueueItem,
} from '@/lib/image-engine';
import { ImageDropZone } from './image-drop-zone';

export function CompressorWorkspace() {
  const [items, setItems] = useState<ImageQueueItem[]>([]);
  const [mode, setMode] = useState<'lossy' | 'lossless'>('lossy');
  const [outFormat, setOutFormat] = useState<CompressOutputFormat>('webp');
  const [quality, setQuality] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<string>('');
  const [maxHeight, setMaxHeight] = useState<string>('');

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

  const handleFilesSelected = async (fileList: FileList | File[]) => {
    setErrors([]);
    setStatusNotice(null);
    const outcome = await validateImageFiles(fileList, null);
    if (outcome.errors.length > 0) setErrors(outcome.errors);
    if (outcome.items.length > 0) {
      setItems((prev) => [...prev, ...outcome.items]);
      setStatusNotice(
        `Added ${outcome.items.length} image${outcome.items.length === 1 ? '' : 's'} — adjust settings and compress below.`
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
      await handleFilesSelected([file]);
    } finally {
      setSampleLoading(false);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target) revokeItemUrls(target);
      return prev.filter((x) => x.id !== id);
    });
  };

  const handleClearAll = () => {
    items.forEach(revokeItemUrls);
    setItems([]);
    setErrors([]);
    setStatusNotice(null);
    setProgress(0);
  };

  const updateSplit = (id: string, split: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, split } : item))
    );
  };

  const handleCompressAll = async () => {
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

    const parsedW = parseInt(maxWidth, 10);
    const parsedH = parseInt(maxHeight, 10);

    const working = [...items];
    for (let i = 0; i < working.length; i++) {
      const current = {
        ...working[i],
        error: null as string | null,
        note: null as string | null,
      };
      try {
        const res = await compressImageItem(current, {
          mode,
          outFormat,
          quality: quality / 100,
          maxWidth: Number.isFinite(parsedW) && parsedW > 0 ? parsedW : null,
          maxHeight: Number.isFinite(parsedH) && parsedH > 0 ? parsedH : null,
        });
        if (current.resultUrl) URL.revokeObjectURL(current.resultUrl);
        current.result = res.blob;
        current.resultUrl = URL.createObjectURL(res.blob);
        current.resultName = res.outName;
        current.note = res.note;
      } catch (err) {
        current.error =
          err instanceof Error ? err.message : 'Compression failed for this image.';
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
      triggerBlobDownload(zipBlob, 'imagetools-compressed.zip');
    } catch {
      setErrors([
        'Could not create ZIP archive. You can download each compressed image individually.',
      ]);
    } finally {
      setZipLoading(false);
    }
  };

  const compressedItems = items.filter((item) => Boolean(item.result));
  const totalOriginal = compressedItems.reduce((sum, x) => sum + x.file.size, 0);
  const totalCompressed = compressedItems.reduce(
    (sum, x) => sum + (x.result?.size ?? 0),
    0
  );
  const totalSavedPct =
    totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#5b6b60] dark:text-[#a7b8ac]">
          Tool 03 · Honest local compression · Zero uploads
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-balance text-[#16211a] sm:text-3xl dark:text-[#eef4ef]">
          Image Compressor
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-[#5b6b60] sm:text-base dark:text-[#a7b8ac]">
          Real savings calculated from your actual files — never estimates. Inspect results with
          a draggable before and after comparison.
        </p>
      </div>

      <ImageDropZone
        ariaLabel="Add images to compress"
        helperText="JPG · PNG · WebP · AVIF · ICO · SVG (SVG is optimised as vector markup). Clipboard paste supported."
        onFilesSelected={handleFilesSelected}
        onUseSample={handleUseSample}
        sampleLoading={sampleLoading}
      />

      {/* Feedback */}
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

      {/* Compression Settings */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#dde3d8] bg-white p-4 sm:grid-cols-2 lg:grid-cols-5 sm:p-5 dark:border-[#2a3a2f] dark:bg-[#16201b]">
        <label className="block">
          <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
            Mode
          </span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'lossy' | 'lossless')}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3 py-2 text-sm font-medium text-[#16211a] focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:focus:border-[#2dd4bf]"
          >
            <option value="lossy">Lossy</option>
            <option value="lossless">Lossless</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
            Output format
          </span>
          <select
            value={outFormat}
            onChange={(e) => setOutFormat(e.target.value as CompressOutputFormat)}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3 py-2 text-sm font-medium text-[#16211a] focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:focus:border-[#2dd4bf]"
          >
            {COMPRESS_OUTPUT_FORMATS.map((fmt) => (
              <option key={fmt} value={fmt}>
                {FORMAT_LABEL[fmt]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="flex items-center justify-between text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
            <span>Quality</span>
            <span className="font-mono tabular-nums text-[#0f766e] dark:text-[#2dd4bf]">
              {mode === 'lossless' ? 'Locked' : `${quality}%`}
            </span>
          </span>
          <div className="mt-3">
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              disabled={mode === 'lossless'}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-[#0f766e] disabled:cursor-not-allowed disabled:opacity-40 dark:accent-[#2dd4bf]"
            />
          </div>
          <span className="mt-1 block text-[11px] text-[#5b6b60] dark:text-[#a7b8ac]">
            Smaller file ← → higher detail
          </span>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
            Max width (px)
          </span>
          <input
            type="number"
            min={1}
            placeholder="e.g. 1600"
            value={maxWidth}
            onChange={(e) => setMaxWidth(e.target.value)}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3 py-2 font-mono text-sm tabular-nums text-[#16211a] placeholder:font-sans placeholder:text-[#5b6b60]/70 focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:placeholder:text-[#a7b8ac]/60 dark:focus:border-[#2dd4bf]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
            Max height (px)
          </span>
          <input
            type="number"
            min={1}
            placeholder="e.g. 1200"
            value={maxHeight}
            onChange={(e) => setMaxHeight(e.target.value)}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3 py-2 font-mono text-sm tabular-nums text-[#16211a] placeholder:font-sans placeholder:text-[#5b6b60]/70 focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:placeholder:text-[#a7b8ac]/60 dark:focus:border-[#2dd4bf]"
          />
        </label>
      </div>

      {/* Honest Lossless Callout */}
      {mode === 'lossless' && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300/80 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed">
            <strong>Honest lossless note:</strong> PNG output and lossless WebP (where supported
            by your browser) keep every pixel intact. JPEG has no lossless re-encode — choosing
            JPG in lossless mode keeps an existing JPEG untouched rather than mislabelling a
            lossy re-encode as “lossless”. SVG files are optimised by stripping metadata,
            comments, and redundant whitespace.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={handleCompressAll}
          disabled={isProcessing}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-[#134e4a] disabled:opacity-50 sm:flex-none dark:bg-[#2dd4bf] dark:text-[#06231f] dark:hover:bg-[#5eead4]"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Minimize2 className="h-4 w-4" />
          )}
          <span>{isProcessing ? `Compressing (${progress}%)…` : 'Compress images'}</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadZip}
          disabled={compressedItems.length === 0 || zipLoading}
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

      {/* Aggregate Savings Summary */}
      {compressedItems.length > 0 && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="font-mono text-xs tabular-nums sm:text-sm">
            Total: {formatBytes(totalOriginal)} →{' '}
            <strong>{formatBytes(totalCompressed)}</strong> (
            {totalCompressed < totalOriginal
              ? `saved ${totalSavedPct}%`
              : 'no net saving at these settings'}
            )
          </p>
        </div>
      )}

      {/* Results / Queue */}
      <div ref={gridRef} className="scroll-mt-20 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#dde3d8] px-6 py-10 text-center text-sm text-[#5b6b60] dark:border-[#2a3a2f] dark:text-[#a7b8ac]">
            No images yet. Drop, browse, paste, or use the sample image above — results with
            before/after comparison will appear here.
          </div>
        ) : (
          items.map((item) => {
            const pct = item.result
              ? Math.round((1 - item.result.size / item.file.size) * 100)
              : null;
            const split = item.split ?? 50;

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-[#dde3d8] bg-white p-4 sm:p-5 dark:border-[#2a3a2f] dark:bg-[#16201b]"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <h3 className="truncate font-sans text-base font-bold text-[#16211a] dark:text-[#eef4ef]">
                      {item.file.name}
                    </h3>
                    <p className="mt-0.5 font-mono text-xs tabular-nums text-[#5b6b60] dark:text-[#a7b8ac]">
                      {FORMAT_LABEL[item.format]} · {formatBytes(item.file.size)}
                      {item.result && pct !== null && (
                        <>
                          {' '}
                          →{' '}
                          <span className="font-semibold text-[#0f766e] dark:text-[#2dd4bf]">
                            {formatBytes(item.result.size)} (
                            {pct >= 0
                              ? `saved ${pct}%`
                              : `grew ${Math.abs(pct)}% — settings kept quality high`}
                            )
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.resultUrl && item.resultName && (
                      <a
                        href={item.resultUrl}
                        download={item.resultName}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#0f766e] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#134e4a] dark:bg-[#2dd4bf] dark:text-[#06231f]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-[#dde3d8] bg-[#f6f7f4] px-3 py-2 text-xs font-semibold text-[#5b6b60] hover:bg-[#eef1ea] hover:text-[#16211a] dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#a7b8ac] dark:hover:text-[#eef4ef]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {item.note && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300/80 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>{item.note}</span>
                  </div>
                )}

                {item.error && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900 dark:border-red-900/70 dark:bg-red-950/60 dark:text-red-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                    <span>{item.error}</span>
                  </div>
                )}

                {/* Before / After Comparison */}
                {item.result && item.resultUrl && item.format !== 'svg' && (
                  <div className="mt-4 space-y-2.5">
                    <div className="bg-checkerboard relative mx-auto max-w-2xl overflow-hidden rounded-xl border border-[#dde3d8] dark:border-[#2a3a2f]">
                      <img
                        src={item.url}
                        alt={`Original ${item.file.name}`}
                        className="block max-h-[380px] w-full object-contain select-none"
                      />
                      <div className="pointer-events-none absolute inset-0">
                        <img
                          src={item.resultUrl}
                          alt={`Compressed ${item.file.name}`}
                          className="h-full w-full object-contain select-none"
                          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
                        />
                      </div>
                      {/* Divider Hairline */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 w-0.5 bg-[#0f766e] shadow-sm dark:bg-[#2dd4bf]"
                        style={{ left: `${split}%` }}
                      />
                      <div className="pointer-events-none absolute left-2.5 top-2.5 rounded-md bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-white">
                        Compressed
                      </div>
                      <div className="pointer-events-none absolute right-2.5 top-2.5 rounded-md bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-white">
                        Original
                      </div>
                    </div>

                    <label className="mx-auto flex max-w-2xl flex-col gap-1.5">
                      <span className="flex items-center justify-between text-xs font-medium text-[#5b6b60] dark:text-[#a7b8ac]">
                        <span className="inline-flex items-center gap-1.5">
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          <span>Slide to compare compressed vs original</span>
                        </span>
                        <span className="font-mono tabular-nums">{split}%</span>
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={split}
                        onChange={(e) => updateSplit(item.id, Number(e.target.value))}
                        className="h-2 w-full cursor-pointer accent-[#0f766e] dark:accent-[#2dd4bf]"
                      />
                    </label>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
