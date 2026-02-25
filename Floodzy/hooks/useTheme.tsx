'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system' | 'high-contrast';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark'); // default to dark mode
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // handle mount → sync dengan localStorage + system preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme) {
        setThemeState(savedTheme);
        setIsDark(savedTheme === 'dark');
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeState('dark');
        setIsDark(true);
      }
      setMounted(true);
    }
  }, []);

  const updateTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'high-contrast');

    if (theme === 'system') {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemIsDark ? 'dark' : 'light');
      setIsDark(systemIsDark);
    } else {
      root.classList.add(theme);
      setIsDark(theme === 'dark');
    }
  }, [theme, mounted]);

  // Pastikan render konsisten saat SSR → tampilkan children hanya setelah mounted
  if (!mounted) {
    return null; // atau skeleton loader kalau mau
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
