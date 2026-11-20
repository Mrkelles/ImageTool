'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FolderOpen, ImagePlus, Upload } from 'lucide-react';
import { ACCEPT_ATTRIBUTE } from '@/lib/formats';

interface ImageDropZoneProps {
  ariaLabel: string;
  helperText: string;
  onFilesSelected: (files: FileList | File[]) => void;
  onUseSample: () => void;
  sampleLoading?: boolean;
}

export function ImageDropZone({
  ariaLabel,
  helperText,
  onFilesSelected,
  onUseSample,
  sampleLoading = false,
}: ImageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const onFilesRef = useRef(onFilesSelected);

  useEffect(() => {
    onFilesRef.current = onFilesSelected;
  }, [onFilesSelected]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const files = event.clipboardData?.files;
      if (files && files.length > 0) {
        event.preventDefault();
        onFilesRef.current(files);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleZoneClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, label')) return;
    inputRef.current?.click();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleZoneClick}
      onKeyDown={handleKeyDown}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          onFilesSelected(e.dataTransfer.files);
        }
      }}
      className={`group cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f766e] sm:p-9 dark:focus-visible:outline-[#2dd4bf] ${
        isDragging
          ? 'border-[#0f766e] bg-[#eef1ea] dark:border-[#2dd4bf] dark:bg-[#1e2b23]'
          : 'border-[#dde3d8] bg-white hover:border-[#0f766e]/60 dark:border-[#2a3a2f] dark:bg-[#16201b] dark:hover:border-[#2dd4bf]/60'
      }`}
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef1ea] text-[#0f766e] transition-transform duration-150 group-hover:scale-105 dark:bg-[#1e2b23] dark:text-[#2dd4bf]">
        <Upload className="h-5 w-5" />
      </div>

      <h2 className="font-display text-lg font-bold text-[#16211a] sm:text-xl dark:text-[#eef4ef]">
        Drop images here, or tap to browse
      </h2>

      <p className="mx-auto mt-1.5 max-w-xl text-xs leading-relaxed text-[#5b6b60] sm:text-sm dark:text-[#a7b8ac]">
        {helperText}
      </p>

      <div className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-[#134e4a] sm:w-auto dark:bg-[#2dd4bf] dark:text-[#06231f] dark:hover:bg-[#5eead4]"
        >
          <FolderOpen className="h-4 w-4 shrink-0" />
          <span>Browse files</span>
        </button>

        <button
          type="button"
          disabled={sampleLoading}
          onClick={onUseSample}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#dde3d8] bg-[#f6f7f4] px-4 py-2.5 text-sm font-semibold text-[#16211a] transition-all active:scale-[0.98] hover:bg-[#eef1ea] disabled:opacity-50 sm:w-auto dark:border-[#2a3a2f] dark:bg-[#1e2b23] dark:text-[#eef4ef] dark:hover:bg-[#26362c]"
        >
          <ImagePlus className="h-4 w-4 shrink-0 text-[#0f766e] dark:text-[#2dd4bf]" />
          <span>{sampleLoading ? 'Creating sample…' : 'Use a sample image'}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(e.target.files);
          }
          e.target.value = '';
        }}
      />
    </div>
  );
}
