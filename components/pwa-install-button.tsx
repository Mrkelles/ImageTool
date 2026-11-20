'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Download,
  MoreVertical,
  PlusSquare,
  Share,
  Smartphone,
  WifiOff,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useOnlineStatus, usePWAInstall } from '@/hooks/use-pwa-install';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sheet' | 'compact';
  onAfterAction?: () => void;
}

export function PWAInstallButton({
  variant = 'header',
  onAfterAction,
}: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // Automatically suppress once running in installed standalone mode
  if (isInstalled) {
    return null;
  }

  // Always show in the mobile "More" slide-in menu; on headers show when prompt or iOS is detected
  const showButton = variant === 'sheet' || isInstallable || isIOS;
  if (!showButton) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
      onAfterAction?.();
    } else {
      setShowGuide(true);
    }
  };

  const guideModal = (
    <AnimatePresence>
      {showGuide && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-[60] flex h-dvh w-full items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-xs"
          onClick={() => setShowGuide(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={isIOS ? 'Install on iPhone or iPad' : 'Install ImageTools App'}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="my-auto max-h-[85dvh] w-full max-w-sm overflow-y-auto rounded-2xl border border-[#dde3d8] bg-white p-6 shadow-xl dark:border-[#2a3a2f] dark:bg-[#16201b]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-[#16211a] dark:text-[#eef4ef]">
                  {isIOS ? 'Install on iPhone or iPad' : 'Install ImageTools App'}
                </h3>
                <p className="mt-1 text-sm text-[#5b6b60] dark:text-[#a7b8ac]">
                  Add ImageTools to your home screen to launch it like a native app.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close install instructions"
                className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-[#5b6b60] hover:bg-[#eef1ea] dark:text-[#a7b8ac] dark:hover:bg-[#1e2b23]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isIOS ? (
              <ol className="mt-5 space-y-3 text-sm text-[#16211a] dark:text-[#eef4ef]">
                <li className="flex items-center gap-3 rounded-xl bg-[#f6f7f4] p-3 dark:bg-[#1e2b23]">
                  <Share className="h-5 w-5 shrink-0 text-[#0f766e] dark:text-[#2dd4bf]" />
                  <span>
                    1. Tap the <strong>Share</strong> icon in Safari&apos;s toolbar.
                  </span>
                </li>
                <li className="flex items-center gap-3 rounded-xl bg-[#f6f7f4] p-3 dark:bg-[#1e2b23]">
                  <PlusSquare className="h-5 w-5 shrink-0 text-[#0f766e] dark:text-[#2dd4bf]" />
                  <span>
                    2. Scroll down and tap <strong>Add to Home Screen</strong>.
                  </span>
                </li>
              </ol>
            ) : (
              <ol className="mt-5 space-y-3 text-sm text-[#16211a] dark:text-[#eef4ef]">
                <li className="flex items-center gap-3 rounded-xl bg-[#f6f7f4] p-3 dark:bg-[#1e2b23]">
                  <MoreVertical className="h-5 w-5 shrink-0 text-[#0f766e] dark:text-[#2dd4bf]" />
                  <span>
                    <strong>Android / Chrome:</strong> Open the browser menu and tap{' '}
                    <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                  </span>
                </li>
                <li className="flex items-center gap-3 rounded-xl bg-[#f6f7f4] p-3 dark:bg-[#1e2b23]">
                  <Share className="h-5 w-5 shrink-0 text-[#0f766e] dark:text-[#2dd4bf]" />
                  <span>
                    <strong>iPhone / iPad Safari:</strong> Tap <strong>Share</strong>, then{' '}
                    <strong>Add to Home Screen</strong>.
                  </span>
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 min-h-[44px] w-full rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#134e4a] dark:bg-[#2dd4bf] dark:text-[#06231f]"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {variant === 'sheet' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex w-full min-h-[48px] items-center justify-between rounded-xl bg-[#0f766e] px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] hover:bg-[#134e4a] dark:bg-[#2dd4bf] dark:text-[#06231f] dark:hover:bg-[#5eead4]"
        >
          <span className="flex items-center gap-2.5">
            <Smartphone className="h-4 w-4 shrink-0" />
            <span>Install App</span>
          </span>
          <Download className="h-4 w-4 shrink-0" />
        </button>
      ) : variant === 'compact' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          aria-label={isIOS ? 'Install on iOS' : 'Install App'}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#0f766e] transition-colors hover:bg-[#eef1ea] dark:text-[#2dd4bf] dark:hover:bg-[#1e2b23]"
          title={isIOS ? 'Install on iOS' : 'Install App'}
        >
          <Download className="h-5 w-5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#0f766e] px-3.5 py-2 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#134e4a] active:scale-[0.98] dark:bg-[#2dd4bf] dark:text-[#06231f] dark:hover:bg-[#5eead4]"
        >
          <Download className="h-4 w-4 shrink-0" />
          <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
        </button>
      )}

      {typeof document !== 'undefined' ? createPortal(guideModal, document.body) : null}
    </>
  );
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 z-40 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-900 shadow-md md:bottom-4 dark:border-amber-700/60 dark:bg-amber-950/90 dark:text-amber-100"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>Offline — loaded tools continue working locally</span>
    </div>
  );
}
