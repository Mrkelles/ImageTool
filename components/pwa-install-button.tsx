'use client';

import React, { useState } from 'react';
import { Download, PlusSquare, Share, Smartphone, WifiOff, X } from 'lucide-react';
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
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
      onAfterAction?.();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const showButton = isInstallable || isIOS;
  if (!showButton) {
    return null;
  }

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
            <span>{isIOS ? 'Add to Home Screen (iOS)' : 'Install ImageTools App'}</span>
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

      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-xs sm:items-center"
            onClick={() => setShowIOSGuide(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[#dde3d8] bg-white p-6 shadow-xl dark:border-[#2a3a2f] dark:bg-[#16201b]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#16211a] dark:text-[#eef4ef]">
                    Install on iPhone or iPad
                  </h3>
                  <p className="mt-1 text-sm text-[#5b6b60] dark:text-[#a7b8ac]">
                    Launch ImageTools directly from your home screen in standalone app mode.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close install instructions"
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-[#5b6b60] hover:bg-[#eef1ea] dark:text-[#a7b8ac] dark:hover:bg-[#1e2b23]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

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

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 min-h-[44px] w-full rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#134e4a] dark:bg-[#2dd4bf] dark:text-[#06231f]"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
