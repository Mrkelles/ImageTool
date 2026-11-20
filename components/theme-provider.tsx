'use client';

import React, { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react';
import { safeStorage } from '@/lib/storage';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  mounted: boolean;
  toggleTheme: () => void;
  setTheme: (next: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  mounted: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

const STORAGE_KEY = 'imagetools-theme';
const themeListeners = new Set<() => void>();

function readClientTheme(): Theme {
  const stored = safeStorage.get(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function subscribeTheme(callback: () => void) {
  themeListeners.add(callback);
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', callback);
  return () => {
    themeListeners.delete(callback);
    mql.removeEventListener('change', callback);
  };
}

function notifyThemeListeners() {
  themeListeners.forEach((cb) => cb());
}

function applyDomTheme(next: Theme) {
  const root = document.documentElement;
  if (next === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}

const emptySubscribe = () => () => {};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const theme = useSyncExternalStore<Theme>(
    subscribeTheme,
    readClientTheme,
    () => 'light'
  );

  useEffect(() => {
    applyDomTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    safeStorage.set(STORAGE_KEY, next);
    applyDomTheme(next);
    notifyThemeListeners();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readClientTheme() === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, mounted, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
