/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  FileText,
  GripVertical,
  Loader2,
  Trash2,
} from 'lucide-react';
import { FORMAT_LABEL } from '@/lib/formats';
import {
  createPdfFromImages,
  createSampleImageFile,
  formatBytes,
  revokeItemUrls,
  validateImageFiles,
  type ImageQueueItem,
  type PdfOptions,
} from '@/lib/image-engine';
import { ImageDropZone } from './image-drop-zone';

export function PdfWorkspace() {
  const [items, setItems] = useState<ImageQueueItem[]>([]);
  const [pageSize, setPageSize] = useState<PdfOptions['pageSize']>('A4');
  const [orientation, setOrientation] = useState<PdfOptions['orientation']>('Auto');
  const [margin, setMargin] = useState<PdfOptions['margin']>('Normal');
  const [fit, setFit] = useState<PdfOptions['fit']>('fit');
  const [quality, setQuality] = useState<number>(0.92);

  const [errors, setErrors] = useState<string[]>([]);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [pdfResult, setPdfResult] = useState<{
    url: string;
    size: number;
    pages: number;
  } | null>(null);

  const itemsRef = useRef<ImageQueueItem[]>([]);
  const pdfUrlRef = useRef<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    pdfUrlRef.current = pdfResult?.url ?? null;
  }, [pdfResult]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach(revokeItemUrls);
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
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
        `Added ${outcome.items.length} page${outcome.items.length === 1 ? '' : 's'} — reorder below if needed.`
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

  const moveItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= items.length || fromIdx === toIdx) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target) revokeItemUrls(target);
      return prev.filter((x) => x.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach(revokeItemUrls);
    if (pdfResult?.url) URL.revokeObjectURL(pdfResult.url);
    setItems([]);
    setPdfResult(null);
    setErrors([]);
    setStatusNotice(null);
  };

  const handleCreatePdf = async () => {
    if (items.length === 0) {
      setErrors(['Add at least one image first — drop, browse, paste, or use the sample image.']);
      return;
    }

    setErrors([]);
    setStatusNotice(null);
    setIsBuilding(true);

    try {
      const blob = await createPdfFromImages(items, {
        pageSize,
        orientation,
        margin,
        fit,
        quality,
      });
      if (pdfResult?.url) URL.revokeObjectURL(pdfResult.url);
      setPdfResult({
        url: URL.createObjectURL(blob),
        size: blob.size,
        pages: items.length,
      });
    } catch (err) {
      setErrors([
        `PDF creation failed: ${err instanceof Error ? err.message : 'Unknown error.'}`,
      ]);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#5b6b60] dark:text-[#a7b8ac]">
          Tool 02 · Ordered multi-page PDF · Zero uploads
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-balance text-[#16211a] sm:text-3xl dark:text-[#eef4ef]">
          Image to PDF
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-[#5b6b60] sm:text-base dark:text-[#a7b8ac]">
          One image per page, in exactly the order you arrange. Use the move buttons or drag
          cards on desktop to reorder pages before exporting.
        </p>
      </div>

      <ImageDropZone
        ariaLabel="Add images for the PDF"
        helperText="JPG · PNG · WebP · AVIF · ICO · SVG — up to 30 MB per image. Clipboard paste supported."
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

      {/* Page Settings */}
      <div className="grid grid-cols-2 gap-3.5 rounded-2xl border border-[#dde3d8] bg-white p-4 sm:grid-cols-3 lg:grid-cols-5 sm:p-5 dark:border-[#2a3a2f] dark:bg-[#16201b]">
        <label className="block">
          <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
            Page size
          </span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value as PdfOptions['pageSize'])}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3 py-2 text-sm font-medium text-[#16211a] focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:focus:border-[#2dd4bf]"
          >
            <option value="A4">A4</option>
            <option value="Letter">Letter</option>
            <option value="Original">Original</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
            Orientation
          </span>
          <select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value as PdfOptions['orientation'])}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3 py-2 text-sm font-medium text-[#16211a] focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:focus:border-[#2dd4bf]"
          >
            <option value="Auto">Auto</option>
            <option value="Portrait">Portrait</option>
            <option value="Landscape">Landscape</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
            Margins
          </span>
          <select
            value={margin}
            onChange={(e) => setMargin(e.target.value as PdfOptions['margin'])}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3 py-2 text-sm font-medium text-[#16211a] focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:focus:border-[#2dd4bf]"
          >
            <option value="Normal">Normal (20 mm)</option>
            <option value="Small">Small (10 mm)</option>
            <option value="None">None (0 mm)</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
            Image fit
          </span>
          <select
            value={fit}
            onChange={(e) => setFit(e.target.value as PdfOptions['fit'])}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3 py-2 text-sm font-medium text-[#16211a] focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:focus:border-[#2dd4bf]"
          >
            <option value="fit">Fit to page</option>
            <option value="fill">Fill page</option>
          </select>
        </label>

        <label className="col-span-2 block sm:col-span-1">
          <span className="text-xs font-semibold text-[#16211a] dark:text-[#eef4ef]">
            Quality
          </span>
          <select
            value={String(quality)}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-3 py-2 text-sm font-medium text-[#16211a] focus:border-[#0f766e] focus:outline-none dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:focus:border-[#2dd4bf]"
          >
            <option value="0.92">High (92%)</option>
            <option value="0.75">Standard (75%)</option>
          </select>
        </label>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={handleCreatePdf}
          disabled={isBuilding}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-[#134e4a] disabled:opacity-50 sm:flex-none dark:bg-[#2dd4bf] dark:text-[#06231f] dark:hover:bg-[#5eead4]"
        >
          {isBuilding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <span>{isBuilding ? 'Building PDF…' : 'Create PDF'}</span>
        </button>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#dde3d8] bg-white px-4 py-2.5 text-sm font-semibold text-[#5b6b60] transition-colors hover:bg-[#eef1ea] hover:text-[#16211a] dark:border-[#2a3a2f] dark:bg-[#16201b] dark:text-[#a7b8ac] dark:hover:bg-[#1e2b23] dark:hover:text-[#eef4ef]"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Result Banner */}
      {pdfResult && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 sm:flex-row sm:items-center dark:border-emerald-800 dark:bg-emerald-950/60">
          <div className="flex items-start gap-2.5 text-sm text-emerald-950 dark:text-emerald-100">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-semibold">imagetools.pdf is ready</p>
              <p className="font-mono text-xs tabular-nums text-emerald-800 dark:text-emerald-300">
                {pdfResult.pages} page{pdfResult.pages === 1 ? '' : 's'} ·{' '}
                {formatBytes(pdfResult.size)}
              </p>
            </div>
          </div>
          <a
            href={pdfResult.url}
            download="imagetools.pdf"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#134e4a] dark:bg-[#2dd4bf] dark:text-[#06231f]"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </a>
        </div>
      )}

      {/* Pages Grid */}
      <div ref={gridRef} className="scroll-mt-20">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#dde3d8] px-6 py-10 text-center text-sm text-[#5b6b60] dark:border-[#2a3a2f] dark:text-[#a7b8ac]">
            No pages yet. Drop, browse, paste, or use the sample image above — pages will appear
            here in order.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, idx) => (
              <article
                key={item.id}
                draggable
                onDragStart={() => setDragIndex(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null && dragIndex !== idx) {
                    moveItem(dragIndex, idx);
                  }
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
                className={`flex flex-col rounded-2xl border bg-white p-3.5 transition-colors dark:bg-[#16201b] ${
                  dragIndex === idx
                    ? 'border-[#0f766e] opacity-70 dark:border-[#2dd4bf]'
                    : 'border-[#dde3d8] dark:border-[#2a3a2f]'
                }`}
              >
                <div className="mb-2 flex items-center justify-between text-xs text-[#5b6b60] dark:text-[#a7b8ac]">
                  <span className="font-mono font-semibold tabular-nums text-[#0f766e] dark:text-[#2dd4bf]">
                    Page {idx + 1}
                  </span>
                  <span className="hidden items-center gap-1 sm:inline-flex">
                    <GripVertical className="h-3.5 w-3.5" />
                    <span>Drag to reorder</span>
                  </span>
                </div>

                <div className="bg-checkerboard flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-[#dde3d8]/70 dark:border-[#2a3a2f]/70">
                  <img
                    src={item.url}
                    alt={`Page ${idx + 1} preview — ${item.file.name}`}
                    className="h-full w-full object-contain p-1"
                  />
                </div>

                <div className="mt-3 flex-1">
                  <h3 className="truncate font-sans text-sm font-semibold text-[#16211a] dark:text-[#eef4ef]">
                    {item.file.name}
                  </h3>
                  <p className="mt-0.5 font-mono text-xs tabular-nums text-[#5b6b60] dark:text-[#a7b8ac]">
                    {FORMAT_LABEL[item.format]} · {formatBytes(item.file.size)}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-1.5 pt-2">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, idx - 1)}
                    aria-label={`Move page ${idx + 1} earlier`}
                    className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1 rounded-lg border border-[#dde3d8] bg-[#f6f7f4] px-2.5 text-xs font-semibold text-[#16211a] transition-colors hover:bg-[#eef1ea] disabled:opacity-40 dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef]"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                    <span>Earlier</span>
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => moveItem(idx, idx + 1)}
                    aria-label={`Move page ${idx + 1} later`}
                    className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1 rounded-lg border border-[#dde3d8] bg-[#f6f7f4] px-2.5 text-xs font-semibold text-[#16211a] transition-colors hover:bg-[#eef1ea] disabled:opacity-40 dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef]"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                    <span>Later</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove page ${idx + 1}`}
                    className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-[#dde3d8] bg-[#f6f7f4] text-[#5b6b60] transition-colors hover:bg-red-50 hover:text-red-700 dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#a7b8ac] dark:hover:bg-red-950/60 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
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
